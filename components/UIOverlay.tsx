
import React from 'react';
import { useStore } from '../store';
import { GestureType } from '../types';

export const UIOverlay: React.FC = () => {
  const { hand, isLoadingVision } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-widest drop-shadow-lg" style={{ filter: "drop-shadow(0 0 10px rgba(0,255,255,0.5))" }}>
            STEMHUB
          </h1>
          <p className="text-[10px] text-cyan-300/60 mt-1 uppercase tracking-[0.4em]">
            圣诞快乐！
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hand.isDetected ? 'bg-cyan-400 shadow-[0_0_10px_#00FFFF]' : 'bg-red-500'}`} />
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              {isLoadingVision ? 'INIT_VISION...' : (hand.isDetected ? 'LINK_ESTABLISHED' : 'SEARCHING_SIGNAL')}
            </span>
          </div>
          {hand.isDetected && (
             <div className="text-[9px] text-white/30 font-light">
                COORD: [{hand.position.x.toFixed(2)}, {hand.position.y.toFixed(2)}]
             </div>
          )}
        </div>
      </div>

      {/* Footer Instructions (Minimal) */}
      <div className="flex justify-center gap-12 text-white/40 text-xs tracking-widest pb-4">
        <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${hand.gesture === GestureType.CLOSED_FIST ? 'text-cyan-400 drop-shadow-[0_0_8px_#00FFFF] scale-110' : ''}`}>
           <span>[ FIST : CONVERGE ]</span>
        </div>
        
        <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${hand.gesture === GestureType.OPEN_HAND ? 'text-purple-400 drop-shadow-[0_0_8px_#8A2BE2] scale-110' : ''}`}>
           <span>[ OPEN : DISPERSE ]</span>
        </div>
        
        <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${hand.gesture === GestureType.PINCH ? 'text-white drop-shadow-[0_0_8px_#FFFFFF] scale-110' : ''}`}>
           <span>[ PINCH : INTERACT ]</span>
        </div>
      </div>
    </div>
  );
};
