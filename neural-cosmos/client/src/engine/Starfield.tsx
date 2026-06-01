/**
 * Layered parallax starfield. Several point clouds at different shell radii
 * rotate at different rates, so orbiting the camera reveals real depth. Counts
 * scale down in low-power mode.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleTexture } from "./textures";

function shell(count: number, rMin: number, rMax: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

function Layer({
  count,
  rMin,
  rMax,
  size,
  color,
  spin,
}: {
  count: number;
  rMin: number;
  rMax: number;
  size: number;
  color: string;
  spin: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => shell(count, rMin, rMax), [count, rMin, rMax]);
  const tex = useMemo(() => particleTexture(), []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += spin * dt;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={tex}
        color={color}
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Starfield({ lowPower }: { lowPower: boolean }) {
  const f = lowPower ? 0.45 : 1;
  return (
    <group>
      <Layer
        count={Math.round(1400 * f)}
        rMin={40}
        rMax={70}
        size={0.6}
        color="#aab4ff"
        spin={0.004}
      />
      <Layer
        count={Math.round(900 * f)}
        rMin={70}
        rMax={110}
        size={1.1}
        color="#cfd6ff"
        spin={0.0018}
      />
      <Layer
        count={Math.round(400 * f)}
        rMin={110}
        rMax={160}
        size={1.8}
        color="#8c7bff"
        spin={0.0008}
      />
    </group>
  );
}
