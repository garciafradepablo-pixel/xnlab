/**
 * The visual suction of a black hole: a swirl of particles spiralling inward and
 * resetting at the rim. "Nothing is deleted — everything is absorbed."
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleTexture } from "./textures";

interface P {
  angle: number;
  radius: number;
  y: number;
  speed: number;
}

export default function BlackHoleInfall({
  radius,
  count = 120,
}: {
  radius: number;
  count?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => particleTexture(), []);

  const outer = radius * 3.4;
  const inner = radius * 0.4;

  const particles = useMemo<P[]>(
    () =>
      Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: inner + Math.random() * (outer - inner),
        y: (Math.random() - 0.5) * radius * 0.6,
        speed: 0.6 + Math.random() * 1.4,
      })),
    [count, inner, outer, radius],
  );

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((_, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.radius -= p.speed * dt * (0.4 + (1 - p.radius / outer));
      p.angle += (dt * 1.6) / Math.max(p.radius, 0.4);
      p.y *= 0.985; // flatten toward the disk as it falls in
      if (p.radius <= inner) {
        p.radius = outer;
        p.y = (Math.random() - 0.5) * radius * 0.6;
      }
      positions[i * 3] = Math.cos(p.angle) * p.radius;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = Math.sin(p.angle) * p.radius;
    }
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        map={tex}
        color="#ff9a3c"
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
