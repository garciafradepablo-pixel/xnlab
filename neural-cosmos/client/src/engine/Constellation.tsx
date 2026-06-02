/**
 * Constellation-stage body: several light nodes around the core, joined by thin
 * additive lines (core→node and node→node) — "varias entidades juntas, nodos
 * conectados por luz". Turns slowly as one figure.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleTexture } from "./textures";

const NODES = 6;

export default function Constellation({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => particleTexture(), []);

  const { nodePositions, segments } = useMemo(() => {
    const R = radius * 2.4;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const a = (i / NODES) * Math.PI * 2;
      const tilt = Math.sin(i * 1.7) * radius * 0.9;
      pts.push(new THREE.Vector3(Math.cos(a) * R, tilt, Math.sin(a) * R));
    }
    const node = new Float32Array(NODES * 3);
    pts.forEach((p, i) => {
      node[i * 3] = p.x;
      node[i * 3 + 1] = p.y;
      node[i * 3 + 2] = p.z;
    });
    // line segments: core→node, plus the ring node→node
    const seg: number[] = [];
    pts.forEach((p, i) => {
      seg.push(0, 0, 0, p.x, p.y, p.z);
      const n = pts[(i + 1) % NODES];
      seg.push(p.x, p.y, p.z, n.x, n.y, n.z);
    });
    return { nodePositions: node, segments: new Float32Array(seg) };
  }, [radius]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });

  return (
    <group ref={ref}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 0.9}
          map={tex}
          color={color}
          transparent
          opacity={0.95}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
