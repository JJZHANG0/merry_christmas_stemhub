import { create } from 'zustand';
import { GestureType, HandState } from './types';

interface AppState {
  hand: HandState;
  setHandState: (partial: Partial<HandState>) => void;
  isLoadingVision: boolean;
  setIsLoadingVision: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  hand: {
    isDetected: false,
    gesture: GestureType.NONE,
    position: { x: 0.5, y: 0.5 },
    rotation: 0,
  },
  isLoadingVision: true,
  setIsLoadingVision: (loading) => set({ isLoadingVision: loading }),
  setHandState: (partial) =>
    set((state) => ({ hand: { ...state.hand, ...partial } })),
}));
