
export enum GestureType {
  NONE = 'NONE',
  OPEN_HAND = 'OPEN_HAND',
  CLOSED_FIST = 'CLOSED_FIST',
  PINCH = 'PINCH'
}

export interface HandState {
  isDetected: boolean;
  gesture: GestureType;
  position: { x: number; y: number }; // Normalized 0-1
  rotation: number; // Radians
}
