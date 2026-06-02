/**
 * Layered parallax starfield + distant nebula haze — the deep-space skybox.
 * Several point clouds at different shell radii rotate at different rates, so
 * orbiting reveals real depth; a few huge, faint coloured clouds sit far out to
 * give the void atmosphere (the "metaverse skybox"). Counts scale down in
 * low-power mode.
 */
import { useMemo, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glowTexture, particleTexture } from "./textures";

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
  opacity = 0.9,
  twinkle = false,
}: {
  count: number;
  rMin: number;
  rMax: number;
  size: number;
  color: string;
  spin: number;
  opacity?: number;
  twinkle?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => shell(count, rMin, rMax), [count, rMin, rMax]);
  const tex = useMemo(() => particleTexture(), []);
  useFrame((state, dt) => {
    if (ref.current) ref.current.rotation.y += spin * dt;
    if (twinkle && matRef.current)
      matRef.current.opacity =
        opacity * (0.82 + 0.18 * Math.sin(state.clock.elapsedTime * 0.8));
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={size}
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// distant coloured clouds — faint, additive, never in focus
const HAZE: { pos: [number, number, number]; scale: number; color: string }[] = [
  { pos: [-95, 28, -120], scale: 130, color: "#7a4fff" },
  { pos: [115, -22, -90], scale: 105, color: "#3a7bff" },
  { pos: [45, 62, -150], scale: 95, color: "#2fd6c0" },
  { pos: [-125, -42, 70], scale: 120, color: "#ff5fae" },
  { pos: [60, -70, 120], scale: 90, color: "#9a6bff" },
];

function NebulaHaze() {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group>
      {HAZE.map((h, i) => (
        <Billboard key={i} position={h.pos}>
          <mesh scale={h.scale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={glow}
              color={h.color}
              transparent
              opacity={0.06}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}

export default function Starfield({ lowPower }: { lowPower: boolean }) {
  const f = lowPower ? 0.45 : 1;
  return (
    <group>
      {!lowPower && <NebulaHaze />}
      <Layer
        count={Math.round(1500 * f)}
        rMin={40}
        rMax={70}
        size={0.6}
        color="#aab4ff"
        spin={0.004}
        opacity={0.9}
        twinkle
      />
      <Layer
        count={Math.round(950 * f)}
        rMin={70}
        rMax={110}
        size={1.1}
        color="#cfd6ff"
        spin={0.0018}
        opacity={0.85}
      />
      <Layer
        count={Math.round(420 * f)}
        rMin={110}
        rMax={160}
        size={1.8}
        color="#8c7bff"
        spin={0.0008}
        opacity={0.7}
      />
      <Layer
        count={Math.round(180 * f)}
        rMin={160}
        rMax={210}
        size={2.6}
        color="#6b5bff"
        spin={0.0004}
        opacity={0.5}
      />
    </group>
  );
}
