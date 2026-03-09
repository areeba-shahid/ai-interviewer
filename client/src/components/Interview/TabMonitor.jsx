import React, { useState, useEffect } from "react";

const TabMonitor = ({ onTabSwitch, onTerminate }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [terminated, setTerminated] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        // IMMEDIATE TERMINATION on first tab switch
        if (!terminated) {
          setTerminated(true);
          onTerminate("Tab switch detected - Interview terminated");
        }
      } else {
        // If they come back, still terminate
        setIsVisible(true);
        if (!terminated) {
          setTerminated(true);
          onTerminate("Tab switch detected - Interview terminated");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onTerminate, terminated]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">🔒 Security Monitor</h3>
      <div className="space-y-2">
        <div
          className={`text-sm font-bold ${
            isVisible ? "text-green-600" : "text-red-600"
          }`}
        >
          {isVisible ? "✅ Interview Active" : "❌ TAB SWITCH DETECTED"}
        </div>

        {terminated && (
          <div className="text-sm text-red-600 font-bold animate-pulse">
            ⚠️ INTERVIEW TERMINATED ⚠️
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Switching tabs will immediately end your interview
        </p>
      </div>
    </div>
  );
};

export default TabMonitor;
