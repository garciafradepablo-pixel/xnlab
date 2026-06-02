/**
 * Spiral arms for galaxy-stage bodies: a thin disk of particles wound into
 * logarithmic arms, turning slowly — the "brazos y tormenta de partículas" of a
 * large ecosystem. Particle count degrades on low-power devices.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverse } from "../store/universe";
import { particleTexture } from "./textures";

const ARMS = 3;
const TURNS = 1.6;

export default function GalaxyArms({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  const ref = useRef<THREE.Points>(null);
  const lowPower = useUniverse((s) => s.lowPower);
  const tex = useMemo(() => particleTexture(), []);
  const count = lowPower ? 320 : 800;
  const maxR = radius * 3.4;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const arm = i % ARMS;
      const t = Math.pow(Math.random(), 0.7); // denser toward the core
      const r = t * maxR;
      const spread = (1 - t) * 0.5 + 0.06;
      const angle =
        t * TURNS * Math.PI * 2 +
        (arm * Math.PI * 2) / ARMS +
        (Math.random() - 0.5) * spread;
      arr[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * radius * 0.4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.5 * (1 - t); // thin disk
      arr[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * radius * 0.4;
    }
    return arr;
  }, [count, maxR, radius]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.06;
  });

  return (
    <points ref={ref} rotation={[Math.PI * 0.12, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.34}
        map={tex}
        color={color}
        transparent
        opacity={0.42}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
