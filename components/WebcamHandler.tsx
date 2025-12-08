import React, { useEffect, useRef } from 'react';
import { initializeVision, processVideoFrame } from '../services/visionService';

// MediaPipe Hand connections for drawing lines
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

export const WebcamHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    initializeVision();

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, frameRate: 30 } 
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
      if (videoRef.current && canvasRef.current) {
        // Process vision (updates store) and get landmarks back for local drawing
        const landmarks = processVideoFrame(videoRef.current);
        
        // Draw to canvas
        draw(landmarks);
        requestRef.current = requestAnimationFrame(predict);
      }
    };

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const draw = (landmarks: any[] | null) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video display size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks) {
      // Style for the skeleton
      ctx.strokeStyle = '#00FFFF'; // Cyan/Blue
      ctx.lineWidth = 5; // Thicker lines for better visibility
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15; // Increased glow

      // Draw Connections
      for (let i = 0; i < CONNECTIONS.length; i++) {
        const startIdx = CONNECTIONS[i][0];
        const endIdx = CONNECTIONS[i][1];
        
        const p1 = landmarks[startIdx];
        const p2 = landmarks[endIdx];
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }

      // Draw Joints (optional, adds tech feel)
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < landmarks.length; i++) {
        const p = landmarks[i];
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, 2 * Math.PI); // Slightly larger joints
        ctx.fill();
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <div className="relative w-28 h-20 md:w-48 md:h-36 overflow-hidden rounded-lg border border-cyan-500/50 bg-black/60 shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-500 ease-in-out pointer-events-auto">
        {/* Container wrapper for mirroring */}
        <div className="relative w-full h-full transform -scale-x-100">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        {/* Decorative corners for tech look */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none"></div>
      </div>
      
      {/* Instruction Text */}
      <div className="text-cyan-400 text-[8px] md:text-[10px] font-bold tracking-widest drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] animate-pulse bg-black/40 px-3 py-1 rounded-full border border-cyan-500/30 transition-all duration-500">
        张开手掌交互吧～
      </div>
    </div>
  );
};
