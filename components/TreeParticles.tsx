
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { GestureType } from '../types';

const COUNT = 1500; // Increased count for denser "forest" feel
const HEIGHT = 14;

// Helper to generate spiral tree positions
const getTreePosition = (i: number) => {
  const t = i / COUNT;
  const angle = t * 65; 
  const r = (1 - t) * 5; 
  const x = r * Math.cos(angle);
  const y = (t * HEIGHT) - (HEIGHT / 2);
  const z = r * Math.sin(angle);
  return new THREE.Vector3(x, y, z);
};

// Helper to generate random cloud positions
const getCloudPosition = () => {
  const x = (Math.random() - 0.5) * 25;
  const y = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 15;
  return new THREE.Vector3(x, y, z);
};

export const TreeParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { hand } = useStore();

  // Precompute positions
  const { treePositions, cloudPositions, colors } = useMemo(() => {
    const tree = new Float32Array(COUNT * 3);
    const cloud = new Float32Array(COUNT * 3);
    const cols = new Float32Array(COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // Tree coords
      const tPos = getTreePosition(i);
      tree[i * 3] = tPos.x;
      tree[i * 3 + 1] = tPos.y;
      tree[i * 3 + 2] = tPos.z;

      // Cloud coords
      const cPos = getCloudPosition();
      cloud[i * 3] = cPos.x;
      cloud[i * 3 + 1] = cPos.y;
      cloud[i * 3 + 2] = cPos.z;

      // Colors: Avatar Palette (Cyan, Blue, Purple, Bio-Green)
      const rand = Math.random();
      if (rand > 0.8) color.set('#00FFFF'); // Cyan
      else if (rand > 0.5) color.set('#8A2BE2'); // BlueViolet
      else if (rand > 0.2) color.set('#0000FF'); // Blue
      else color.set('#39FF14'); // Bio Green

      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return { treePositions: tree, cloudPositions: cloud, colors: cols };
  }, []);

  const bufferRef = useRef<THREE.BufferAttribute>(null);

  useFrame((state, delta) => {
    if (!bufferRef.current || !pointsRef.current) return;

    let targetDispersion = 0; 
    if (hand.gesture === GestureType.OPEN_HAND) targetDispersion = 1;
    
    // Rotation logic
    let targetRotY = state.clock.getElapsedTime() * 0.05; // Slower, more mysterious rotation
    
    if (hand.isDetected) {
       const rotSpeed = (hand.position.x - 0.5) * 2;
       pointsRef.current.rotation.y += rotSpeed * delta * 1.5;
    } else {
       pointsRef.current.rotation.y += delta * 0.05;
    }

    // Morph positions
    const positions = bufferRef.current.array as Float32Array;
    
    const currentDispersion = THREE.MathUtils.lerp(
      pointsRef.current.userData.dispersion || 0,
      targetDispersion,
      delta * 1.5
    );
    pointsRef.current.userData.dispersion = currentDispersion;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const tx = treePositions[ix];
      const ty = treePositions[iy];
      const tz = treePositions[iz];

      const cx = cloudPositions[ix];
      const cy = cloudPositions[iy];
      const cz = cloudPositions[iz];

      // Lerp base position
      let px = THREE.MathUtils.lerp(tx, cx, currentDispersion);
      let py = THREE.MathUtils.lerp(ty, cy, currentDispersion);
      let pz = THREE.MathUtils.lerp(tz, cz, currentDispersion);

      // Add "breathing" organic wave movement (Avatar forest feel)
      // Every particle moves slightly in a sine wave
      const noise = Math.sin(time + i * 0.1) * 0.05;
      px += noise;
      py += Math.cos(time + i * 0.2) * 0.05;
      pz += Math.sin(time + i * 0.3) * 0.05;

      positions[ix] = px;
      positions[iy] = py;
      positions[iz] = pz;
    }
    
    bufferRef.current.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={new Float32Array(treePositions)} 
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};
