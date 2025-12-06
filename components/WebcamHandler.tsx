import React, { useEffect, useRef } from 'react';
import { initializeVision, processVideoFrame } from '../services/visionService';

export const WebcamHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    initializeVision();

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, frameRate: 30 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predict);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();

    const predict = () => {
      if (videoRef.current) {
        processVideoFrame(videoRef.current);
        requestRef.current = requestAnimationFrame(predict);
      }
    };

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="fixed top-0 left-0 w-32 h-24 opacity-0 pointer-events-none z-0"
    />
  );
};
