import React, { useState, useEffect, useRef } from "react";

const CameraMonitor = ({ onStatusChange, onTerminate }) => {
  const [isActive, setIsActive] = useState(false);
  const [warning, setWarning] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsActive(true);
        onStatusChange(true);
        setWarning("");

        startBrightnessCheck();
      } catch (error) {
        console.error("Camera access denied:", error);

        setIsActive(false);
        onStatusChange(false);

        setWarning("Camera access required");

        if (onTerminate) {
          onTerminate("Camera access required for interview");
        }
      }
    };

    const startBrightnessCheck = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      intervalRef.current = setInterval(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        let brightness = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          brightness += (r + g + b) / 3;
        }

        brightness = brightness / (data.length / 4);

        if (brightness < 30) {
          setWarning("Camera blocked or environment too dark");
        } else {
          setWarning("");
        }
      }, 2000);
    };

    startCamera();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onStatusChange, onTerminate]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">📹 Camera Monitor</h3>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-32 bg-gray-900 rounded-lg object-cover mb-2"
      />

      <div className="space-y-2">
        <div
          className={`text-sm font-bold ${
            isActive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isActive ? "✅ Camera active" : "❌ Camera inactive"}
        </div>

        {warning && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded animate-pulse">
            ⚠️ {warning}
          </div>
        )}

        {isActive && !warning && (
          <div className="text-sm text-green-600">👤 Camera ready</div>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;
