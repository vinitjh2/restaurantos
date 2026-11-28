# DineSutra Edge AI CCTV Agent

Connects your local CP Plus / Hikvision / Dahua Wi-Fi RTSP cameras (or a local webcam for demo) to **DineSutra AI CCTV Radar** (`https://dine.sutrauniverse.com/tables/cctv`).

## Quick Start

1. Install Python 3.10+ and dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Open **DineSutra -> Tables -> AI CCTV Radar -> RTSP Streams** and add your cameras (copy each camera's `cameraId` and `edgeToken`).
3. Create `cameras.json`:
   ```json
   {
     "apiUrl": "https://dine.sutrauniverse.com",
     "cameras": [
       {
         "cameraId": "YOUR_CAMERA_ID",
         "edgeToken": "YOUR_EDGE_TOKEN",
         "name": "Main Dining Cam 01",
         "rtspUrl": "rtsp://admin:admin@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0"
       }
     ]
   }
   ```
4. Run:
   ```bash
   python agent.py --config cameras.json
   ```
