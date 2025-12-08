
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { GestureType } from '../types';

let handLandmarker: HandLandmarker | undefined;
let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
let lastVideoTime = -1;

export const initializeVision = async () => {
  const { setIsLoadingVision } = useStore.getState();
  setIsLoadingVision(true);

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: 'GPU',
      },
      runningMode: runningMode,
      numHands: 1,
    });
    console.log('Vision initialized');
  } catch (err) {
    console.error('Failed to init vision', err);
  } finally {
    setIsLoadingVision(false);
  }
};

const detectGesture = (landmarks: any[]): GestureType => {
  if (!landmarks || landmarks.length === 0) return GestureType.NONE;

  // Key landmarks
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const wrist = landmarks[0];
  const indexPip = landmarks[6]; // Knuckle
  const middlePip = landmarks[10];
  const ringPip = landmarks[14];
  const pinkyPip = landmarks[18];

  // 1. Check for Pinch (Thumb + Index touching)
  const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
  const isPinch = pinchDist < 0.05;

  // 2. Count extended fingers (excluding thumb for basic check)
  const fingers = [
    { tip: indexTip, pip: indexPip },
    { tip: middleTip, pip: middlePip },
    { tip: ringTip, pip: ringPip },
    { tip: pinkyTip, pip: pinkyPip },
  ];
  
  let extendedCount = 0;
  fingers.forEach(f => {
    // If tip is higher (lower y value) than pip, it's extended (mostly)
    // But this depends on hand rotation. Better to check distance from wrist.
    const distTip = Math.hypot(f.tip.x - wrist.x, f.tip.y - wrist.y);
    const distPip = Math.hypot(f.pip.x - wrist.x, f.pip.y - wrist.y);
    if (distTip > distPip) extendedCount++;
  });

  // Heuristics
  if (extendedCount === 0) return GestureType.CLOSED_FIST;
  if (extendedCount >= 3) return GestureType.OPEN_HAND;
  if (isPinch) return GestureType.PINCH;

  return GestureType.NONE;
};

const calculateRotation = (landmarks: any[]): number => {
  if (!landmarks) return 0;
  // Wrist to Middle Finger MCP (Joint 9) provides a good vector for hand roll/tilt
  const p1 = landmarks[0];
  const p2 = landmarks[9];
  // Calculate angle
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const processVideoFrame = (video: HTMLVideoElement): any[] | null => {
  if (!handLandmarker || video.currentTime === lastVideoTime) return null;

  lastVideoTime = video.currentTime;
  const startTimeMs = performance.now();
  
  const result = handLandmarker.detectForVideo(video, startTimeMs);
  
  const { setHandState } = useStore.getState();

  if (result.landmarks && result.landmarks.length > 0) {
    const landmarks = result.landmarks[0];
    const gesture = detectGesture(landmarks);
    const rotation = calculateRotation(landmarks);
    
    // Calculate center of palm
    const palmX = landmarks[9].x; // Use knuckle as center logic
    const palmY = landmarks[9].y;

    setHandState({
      isDetected: true,
      gesture,
      position: { x: 1 - palmX, y: palmY }, // Mirror X for natural feeling
      rotation,
    });

    // Return landmarks for drawing
    return landmarks;
  } else {
    setHandState({ isDetected: false, gesture: GestureType.NONE });
    return null;
  }
};
