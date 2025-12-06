
import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { PhotoCloud } from './PhotoCloud';
import { useStore } from '../store';

// Syncs the Hand Position (0-1) to the Three.js State Pointer (-1 to 1)
const HandCursor = () => {
  const { hand } = useStore();
  const { pointer, viewport } = useThree();
  
  useFrame(() => {
    if (hand.isDetected) {
       const x = (hand.position.x * 2) - 1;
       const y = -(hand.position.y * 2) + 1; 
       pointer.lerp(new THREE.Vector2(x, y), 0.2);
    }
  });
  
  return (
     <mesh visible={hand.isDetected} position={[pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 8]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} depthTest={false} blending={THREE.AdditiveBlending} />
     </mesh>
  );
};

export const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 16], fov: 50 }}
      gl={{ 
        antialias: false, 
        alpha: false,
        powerPreference: "high-performance",
        depth: true
      }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#020205']} />
      
      <HandCursor />

      {/* Cinematic Lighting - Avatar Style (Cool Blues/Purples) */}
      <ambientLight intensity={0.1} color="#000033" />
      <pointLight position={[10, 5, 10]} intensity={1.0} color="#00FFFF" />
      <pointLight position={[-10, -5, -5]} intensity={0.8} color="#8A2BE2" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#39FF14" />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#020205', 10, 40]} />

      <TreeParticles />
      <PhotoCloud />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
      {/* Floating dust/spores */}
      <Sparkles count={300} scale={25} size={3} speed={0.2} opacity={0.4} color="#88CCFF" />

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.1} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
            levels={8}
        />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer>

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};
