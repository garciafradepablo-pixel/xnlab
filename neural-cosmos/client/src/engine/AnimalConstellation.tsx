/**
 * Renders an archetype animal as a glowing constellation around its body: stars
 * at the vertices, light lines along the edges. Billboards to face the camera
 * and brightens as you approach — "the animal only insinuates itself on zoom".
 */
import { useMemo, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMAL_SHAPES } from "./animal-shapes";
import { particleTexture } from "./textures";

export default function AnimalConstellation({
  animal,
  color,
  radius,
  worldPos,
}: {
  animal: string;
  color: string;
  radius: number;
  worldPos: THREE.Vector3;
}) {
  const camera = useThree((s) => s.camera);
  const tex = useMemo(() => particleTexture(), []);
  const linesRef = useRef<THREE.LineSegments>(null);
  const starsRef = useRef<THREE.Points>(null);

  const shape = ANIMAL_SHAPES[animal];
  const scale = radius * 2.8;

  const { vertices, segments } = useMemo(() => {
    if (!shape) return { vertices: new Float32Array(0), segments: new Float32Array(0) };
    const verts = new Float32Array(shape.points.length * 3);
    shape.points.forEach((p, i) => {
      verts[i * 3] = p[0] * scale;
      verts[i * 3 + 1] = p[1] * scale;
      verts[i * 3 + 2] = 0;
    });
    const seg = new Float32Array(shape.edges.length * 6);
    shape.edges.forEach((e, i) => {
      const a = shape.points[e[0]];
      const b = shape.points[e[1]];
      seg[i * 6] = a[0] * scale;
      seg[i * 6 + 1] = a[1] * scale;
      seg[i * 6 + 2] = 0;
      seg[i * 6 + 3] = b[0] * scale;
      seg[i * 6 + 4] = b[1] * scale;
      seg[i * 6 + 5] = 0;
    });
    return { vertices: verts, segments: seg };
  }, [shape, scale]);

  useFrame(() => {
    // brighten as the camera nears the body
    const d = camera.position.distanceTo(worldPos);
    const close = THREE.MathUtils.clamp(1 - (d - radius * 4) / 40, 0.18, 1);
    if (linesRef.current) {
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = close * 0.7;
    }
    if (starsRef.current) {
      (starsRef.current.material as THREE.PointsMaterial).opacity = close;
    }
  });

  if (!shape) return null;

  return (
    <Billboard>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[vertices, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 0.5}
          map={tex}
          color={color}
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Billboard>
  );
}
