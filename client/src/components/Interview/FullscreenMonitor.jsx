import React, { useState, useEffect } from "react";
import Card from "../UI/Card";
import Button from "../UI/Button";

const FullscreenMonitor = ({ onFullscreenChange, onTerminate }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  // Detect fullscreen (works for F11 and JS fullscreen)
  const checkFullscreen = () => {
    const jsFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const browserFullscreen = window.innerHeight === window.screen.height;

    return !!jsFullscreen || browserFullscreen;
  };

  useEffect(() => {
    const detectFullscreen = () => {
      const fs = checkFullscreen();
      setIsFullscreen(fs);

      if (onFullscreenChange) {
        onFullscreenChange(fs);
      }

      if (!fs) {
        setFullscreenError("Fullscreen mode required");
      } else {
        setFullscreenError("");
      }
    };

    // Detect fullscreen changes
    document.addEventListener("fullscreenchange", detectFullscreen);
    document.addEventListener("webkitfullscreenchange", detectFullscreen);
    document.addEventListener("mozfullscreenchange", detectFullscreen);
    document.addEventListener("MSFullscreenChange", detectFullscreen);

    // Detect resize (for F11 fullscreen)
    window.addEventListener("resize", detectFullscreen);

    // Run check every 500ms
    const interval = setInterval(detectFullscreen, 500);

    detectFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", detectFullscreen);
      document.removeEventListener("webkitfullscreenchange", detectFullscreen);
      document.removeEventListener("mozfullscreenchange", detectFullscreen);
      document.removeEventListener("MSFullscreenChange", detectFullscreen);
      window.removeEventListener("resize", detectFullscreen);
      clearInterval(interval);
    };
  }, [onFullscreenChange]);

  // Request fullscreen programmatically
  const requestFullscreen = async () => {
    try {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        setFullscreenError("Fullscreen not supported in this browser");
        if (onTerminate) onTerminate("Fullscreen not supported");
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      setFullscreenError("Click again to retry fullscreen");
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">🖥️ Fullscreen Mode</h3>

      {/* Status */}
      <div className="flex justify-between items-center mb-3">
        <span>Status:</span>

        {isFullscreen ? (
          <span className="text-green-600 font-bold">✅ Active</span>
        ) : (
          <span className="text-red-600 font-bold">❌ Inactive</span>
        )}
      </div>

      {/* Error */}
      {fullscreenError && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-3">
          ⚠️ {fullscreenError}
        </div>
      )}

      {/* Instructions */}
      {!isFullscreen && (
        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded mb-3">
          <p className="font-medium mb-1">Fullscreen Required</p>

          <ul className="list-disc list-inside text-xs space-y-1">
            <li>
              Press <b>F11</b>
            </li>
            <li>Click the button below</li>
            <li>Use browser menu → Enter Fullscreen</li>
          </ul>
        </div>
      )}

      {/* Button */}
      {!isFullscreen && (
        <Button onClick={requestFullscreen} size="sm" className="w-full">
          Enter Fullscreen
        </Button>
      )}

      {/* Success */}
      {isFullscreen && (
        <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
          Fullscreen active
        </div>
      )}
    </Card>
  );
};

export default FullscreenMonitor;
