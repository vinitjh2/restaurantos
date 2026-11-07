"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  subtitle?: string;
}

export function QrCameraScanner({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Scan Table or Loyalty QR Code",
  subtitle = "Align the QR code or food barcode inside the frame",
}: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      setError(null);
      // Attempt accessing camera
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: "environment" },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.warn("[CameraScanner] Camera access unavailable:", err);
          setError("Camera permission denied or camera device not found. You can enter the code manually below.");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative my-4 aspect-square w-full overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {/* Aiming Reticle */}
              <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-dashed border-amber-400/80 animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-semibold text-amber-300 bg-black/60 px-2 py-0.5 rounded">
                  Point at barcode / QR
                </span>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              {error ? (
                <div className="flex flex-col items-center gap-2 text-rose-400">
                  <AlertCircle className="h-8 w-8" />
                  <span>{error}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                  <span>Initializing camera sensor...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Barcode / Table Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Manual Barcode / QR Identifier
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. T-04 or 8901030383748"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono font-medium focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!manualCode.trim()}
              className="flex-1 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Accept Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
