#!/usr/bin/env python3
"""
DineSutra Edge AI CCTV Agent
Reads 1..N local RTSP camera streams (CP Plus, Hikvision, Dahua, ONVIF, or local webcam),
runs YOLOv8 person detection, maps occupancy to configured table polygons,
tracks 5-minute Waiter SLA timers & dirty tables, and pushes telemetry + live snapshots
to DineSutra Cloud (/api/cctv/ingest).
"""

import argparse
import base64
import json
import os
import threading
import time
from typing import Any, Dict, List, Tuple

import cv2
import numpy as np
import requests
from ultralytics import YOLO


def point_in_polygon(px: float, py: float, polygon: List[Dict[str, float]]) -> bool:
    if len(polygon) < 3:
        return False
    inside = False
    n = len(polygon)
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]["x"], polygon[i]["y"]
        xj, yj = polygon[j]["x"], polygon[j]["y"]
        intersect = ((yi > py) != (yj > py)) and (
            px < (xj - xi) * (py - yi) / ((yj - yi) or 1e-9) + xi
        )
        if intersect:
            inside = not inside
        j = i
    return inside


class CameraWorker(threading.Thread):
    def __init__(
        self,
        api_url: str,
        cam_cfg: Dict[str, Any],
        model: YOLO,
        model_lock: threading.Lock,
        interval_sec: float = 2.0,
    ):
        super().__init__(daemon=True)
        self.api_url = api_url.rstrip("/")
        self.camera_id = cam_cfg["cameraId"]
        self.token = cam_cfg["edgeToken"]
        self.rtsp_url = cam_cfg["rtspUrl"]
        self.name = cam_cfg.get("name", self.camera_id)
        self.model = model
        self.model_lock = model_lock
        self.interval_sec = interval_sec
        self.table_zones: List[Dict[str, Any]] = cam_cfg.get("tableZones", [])
        self.table_state: Dict[str, Dict[str, Any]] = {}

    def _open_capture(self) -> cv2.VideoCapture:
        src: Any = int(self.rtsp_url) if str(self.rtsp_url).isdigit() else self.rtsp_url
        cap = cv2.VideoCapture(src, cv2.CAP_FFMPEG) if isinstance(src, str) else cv2.VideoCapture(src)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        return cap

    def _update_table_states(self, detections: List[Dict[str, Any]], dt: float) -> List[Dict[str, Any]]:
        results = []
        for zone in self.table_zones:
            tid = zone.get("tableNumber") or zone.get("id")
            poly = zone.get("polygon", [])
            guests = 0
            for det in detections:
                cx = det["box"]["x"] + det["box"]["w"] / 2.0
                cy = det["box"]["y"] + det["box"]["h"] / 2.0
                if point_in_polygon(cx, cy, poly):
                    guests += 1

            prev = self.table_state.get(tid, {
                "status": "FREE",
                "seatedSeconds": 0.0,
                "departedSeconds": 0.0,
                "hadGuests": False,
            })

            if guests > 0:
                seated_sec = prev["seatedSeconds"] + dt
                status = "SLA_BREACH" if seated_sec >= 300 else "SEATED"
                state = {
                    "status": status,
                    "seatedSeconds": seated_sec,
                    "departedSeconds": 0.0,
                    "hadGuests": True,
                }
            else:
                if prev["hadGuests"] and prev["departedSeconds"] < 120:
                    dep_sec = prev["departedSeconds"] + dt
                    state = {
                        "status": "DIRTY",
                        "seatedSeconds": 0.0,
                        "departedSeconds": dep_sec,
                        "hadGuests": True,
                    }
                else:
                    state = {
                        "status": "FREE",
                        "seatedSeconds": 0.0,
                        "departedSeconds": 0.0,
                        "hadGuests": False,
                    }

            self.table_state[tid] = state
            results.append({
                "id": tid,
                "tableNumber": tid,
                "section": zone.get("section", "Main Dining"),
                "capacity": zone.get("capacity", 4),
                "status": state["status"],
                "guestCount": guests,
                "seatedSeconds": int(state["seatedSeconds"]),
                "noWaiterAlert": state["status"] == "SLA_BREACH",
                "guestsDepartedSeconds": int(state["departedSeconds"]),
                "polygon": poly,
            })
        return results

    def run(self):
        print(f"[{self.name}] Starting RTSP worker -> {self.rtsp_url}")
        cap = self._open_capture()
        last_tick = time.time()

        while True:
            if not cap.isOpened():
                print(f"[{self.name}] Stream disconnected. Reconnecting in 5s...")
                time.sleep(5)
                cap.release()
                cap = self._open_capture()
                continue

            # Drain buffer & grab latest frame
            ok, frame = cap.read()
            if not ok or frame is None:
                print(f"[{self.name}] Failed to read frame. Reconnecting...")
                cap.release()
                time.sleep(3)
                cap = self._open_capture()
                continue

            now = time.time()
            dt = max(0.5, now - last_tick)
            last_tick = now

            h, w = frame.shape[:2]
            t0 = time.time()
            with self.model_lock:
                preds = self.model.predict(frame, classes=[0], conf=0.4, verbose=False)
            infer_ms = (time.time() - t0) * 1000.0
            fps = round(1000.0 / max(infer_ms, 1.0), 1)

            detections: List[Dict[str, Any]] = []
            if preds and len(preds) > 0 and preds[0].boxes is not None:
                for idx, box in enumerate(preds[0].boxes):
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    detections.append({
                        "id": f"p-{idx}",
                        "type": "CUSTOMER",
                        "label": f"Guest {conf:.0%}",
                        "box": {
                            "x": round((x1 / w) * 100, 2),
                            "y": round((y1 / h) * 100, 2),
                            "w": round(((x2 - x1) / w) * 100, 2),
                            "h": round(((y2 - y1) / h) * 100, 2),
                        },
                    })
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (16, 185, 129), 2)

            tables = self._update_table_states(detections, dt)

            # Resize & encode compressed snapshot for browser live view
            scale = min(1.0, 640.0 / max(w, 1))
            small = cv2.resize(frame, (int(w * scale), int(h * scale)))
            _, buf = cv2.imencode(".jpg", small, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            snapshot_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")

            try:
                resp = requests.post(
                    f"{self.api_url}/api/cctv/ingest",
                    headers={"x-cctv-token": self.token, "Content-Type": "application/json"},
                    json={
                        "cameraId": self.camera_id,
                        "tables": tables,
                        "detections": detections,
                        "snapshotBase64": snapshot_b64,
                        "fps": fps,
                        "model": "YOLOv8n-Person",
                    },
                    timeout=8,
                )
                if resp.ok:
                    data = resp.json()
                    if isinstance(data.get("tableZones"), list):
                        self.table_zones = data["tableZones"]
                else:
                    print(f"[{self.name}] Ingest HTTP {resp.status_code}: {resp.text[:120]}")
            except Exception as exc:
                print(f"[{self.name}] Push error: {exc}")

            elapsed = time.time() - now
            if elapsed < self.interval_sec:
                time.sleep(self.interval_sec - elapsed)


def main():
    parser = argparse.ArgumentParser(description="DineSutra Edge AI CCTV Agent")
    parser.add_argument("--config", default="cameras.json", help="Path to cameras.json config")
    parser.add_argument("--api-url", default="https://dine.sutrauniverse.com", help="DineSutra base URL")
    parser.add_argument("--interval", type=float, default=2.0, help="Seconds between AI ticks")
    args = parser.parse_args()

    if not os.path.exists(args.config):
        raise FileNotFoundError(f"Config file not found: {args.config}")

    with open(args.config, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    api_url = cfg.get("apiUrl", args.api_url)
    cameras = cfg.get("cameras", [])
    if not cameras:
        raise ValueError("No cameras configured in cameras.json")

    print("Loading YOLOv8n model...")
    model = YOLO("yolov8n.pt")
    model_lock = threading.Lock()

    workers = []
    for cam in cameras:
        w = CameraWorker(api_url, cam, model, model_lock, interval_sec=args.interval)
        w.start()
        workers.append(w)

    print(f"Started {len(workers)} camera worker(s). Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Shutting down Edge AI CCTV Agent.")


if __name__ == "__main__":
    main()
