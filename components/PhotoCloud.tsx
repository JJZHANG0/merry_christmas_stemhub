
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { GestureType } from '../types';
import { easing } from 'maath';

const ORBS_COUNT = 12; // More orbs since they are smaller/lighter
const RADIUS = 4;
const HEIGHT = 10;

interface OrbData {
  id: number;
  treePos: THREE.Vector3;
  cloudPos: THREE.Vector3;
  baseColor: string;
}

export const PhotoCloud: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { hand } = useStore();
  const [hovered, setHovered] = useState<number | null>(null);

  const orbs = useMemo(() => {
    const data: OrbData[] = [];
    const colors = ['#00FFFF', '#FF00FF', '#39FF14', '#FFFFFF'];
    
    for (let i = 0; i < ORBS_COUNT; i++) {
      const t = i / ORBS_COUNT;
      const angle = t * Math.PI * 8; 
      const y = (t * HEIGHT) - (HEIGHT / 2) + 0.5;
      const r = (1 - t * 0.5) * RADIUS; 
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );

      const cloudPos = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 
      );

      data.push({
        id: i,
        treePos,
        cloudPos,
        baseColor: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetDispersion = hand.gesture === GestureType.OPEN_HAND ? 1 : 0;
    
    if (hand.isDetected) {
       const rotSpeed = (hand.position.x - 0.5) * 2; 
       groupRef.current.rotation.y += rotSpeed * delta * 1.5;
    } else {
       groupRef.current.rotation.y += delta * 0.05;
    }

    const currentDispersion = THREE.MathUtils.lerp(
        groupRef.current.userData.dispersion || 0,
        targetDispersion,
        delta * 1.5
    );
    groupRef.current.userData.dispersion = currentDispersion;
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb) => (
        <SpiritOrb 
            key={orb.id} 
            data={orb} 
            isHovered={hovered === orb.id}
            onHover={setHovered}
        />
      ))}
    </group>
  );
};

const SpiritOrb: React.FC<{ 
    data: OrbData, 
    isHovered: boolean, 
    onHover: (id: number | null) => void 
}> = ({ data, isHovered, onHover }) => {
    const ref = useRef<THREE.Group>(null);
    const { hand } = useStore();

    useFrame((state, delta) => {
        if (!ref.current || !ref.current.parent) return;
        
        const dispersion = ref.current.parent.userData.dispersion || 0;
        
        const targetPos = new THREE.Vector3().lerpVectors(
            data.treePos,
            data.cloudPos,
            dispersion
        );

        // Add floaty movement
        const time = state.clock.getElapsedTime();
        targetPos.y += Math.sin(time * 2 + data.id) * 0.2;

        easing.damp3(ref.current.position, targetPos, 0.5, delta);
        
        // Scale and Color Interaction
        let targetScale = 1.0;
        let scaleSpeed = 0.3;

        if (isHovered) {
            targetScale = 1.5;
            if (hand.gesture === GestureType.PINCH) {
                targetScale = 2.5; // "Absorb" energy effect
                scaleSpeed = 0.1;
            }
        }
        
        easing.damp(ref.current.scale, 'x', targetScale, scaleSpeed, delta);
        easing.damp(ref.current.scale, 'y', targetScale, scaleSpeed, delta);
        easing.damp(ref.current.scale, 'z', targetScale, scaleSpeed, delta);
    });

    return (
        <group ref={ref}>
            <mesh 
                onPointerOver={() => onHover(data.id)}
                onPointerOut={() => onHover(null)}
            >
                {/* Core of the spirit orb */}
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial 
                    color={isHovered ? '#FFFFFF' : data.baseColor} 
                    transparent 
                    opacity={0.8} 
                />
            </mesh>
            {/* Outer Glow Halo */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial 
                    color={data.baseColor} 
                    transparent 
                    opacity={0.3} 
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
             {/* Point Light for real illumination */}
             <pointLight 
                color={data.baseColor} 
                intensity={isHovered ? 2 : 0.5} 
                distance={3} 
                decay={2} 
            />
        </group>
    )
}
