import React, { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

interface VideoCallFrameProps {
  url: string;
  token: string;
  onCallObjectReady?: (callObject: any) => void;
}

// Create a global variable to track if a Daily instance exists
let globalCallObject: any = null;

const VideoCallFrame: React.FC<VideoCallFrameProps> = ({
  url,
  token,
  onCallObjectReady,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);

  useEffect(() => {
    // Clean up function to destroy the call object
    const cleanup = () => {
      if (callObjectRef.current) {
        console.log("Destroying Daily call object");
        callObjectRef.current.destroy();
        callObjectRef.current = null;
        globalCallObject = null;
      }
    };

    // Only create the call object if the wrapper is ready and no global instance exists
    if (!wrapperRef.current || globalCallObject) {
      return cleanup;
    }

    try {
      console.log("Creating new Daily call object");
      const daily = DailyIframe.createFrame(wrapperRef.current, {
        url: `${url}?token=${token}`,
        showLeaveButton: false,
        showFullscreenButton: true,
      });

      daily.join();
      callObjectRef.current = daily;
      globalCallObject = daily;

      if (onCallObjectReady) {
        onCallObjectReady(daily);
      }
    } catch (error) {
      console.error("Error creating Daily call object:", error);
    }

    // Clean up when component unmounts
    return cleanup;
  }, [url, token, onCallObjectReady]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full bg-gray-900"
      style={{ height: "calc(100vh - 160px)" }}
    />
  );
};

export default VideoCallFrame;
