import React, { Suspense } from 'react';
import { WebcamHandler } from './components/WebcamHandler';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Computer Vision Layer */}
      <WebcamHandler />
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="text-white text-center mt-40">Loading 3D Engine...</div>}>
          <Experience />
        </Suspense>
      </div>

      {/* UI Overlay */}
      <UIOverlay />
      
      {/* Scanlines Effect Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm95aG5sMnR6bXh4b3J2aXN4Z3V2bm95aG5sMnR6bXh4b3J2aXN4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD0ILhi08LGF1PG/giphy.gif')] mix-blend-overlay bg-cover" />
    </div>
  );
};

export default App;
