/**
 * System-stage body: a faint orbit ring with small bodies actually circling it —
 * "estrella con cuerpos orbitando", i.e. it produces sub-entities.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SATELLITES = 3;

export default function SystemOrbit({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  const ring = useRef<THREE.Group>(null);
  const orbitR = radius * 2.3;

  const offsets = useMemo(
    () =>
      Array.from({ length: SATELLITES }, (_, i) => ({
        phase: (i / SATELLITES) * Math.PI * 2,
        speed: 0.4 + i * 0.18,
        size: radius * (0.18 + (i % 2) * 0.07),
      })),
    [radius],
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    offsets.forEach((o, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = o.phase + t * o.speed;
      m.position.set(Math.cos(a) * orbitR, Math.sin(a) * orbitR * 0.32, Math.sin(a) * orbitR);
    });
    if (ring.current) ring.current.rotation.z += 0.0015;
  });

  return (
    <group ref={ring} rotation={[Math.PI * 0.35, 0, 0]}>
      {/* orbit guide */}
      <mesh>
        <ringGeometry args={[orbitR * 0.99, orbitR * 1.01, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {offsets.map((o, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[o.size, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}
    </group>
  );
}
