/**
 * The archetype animal as a luminous, illustrated glyph billboarded onto the
 * body, with a faint 3D star-dust halo around it for volume. The glyph stays
 * legible from any orbit angle (it billboards), twinkles softly, and brightens
 * as the camera nears — it is the entity's signature, always readable.
 */
import { useMemo, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMAL_SHAPES } from "./animal-shapes";
import { animalArtTexture } from "./animal-art";
import { particleTexture } from "./textures";

function rand(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function AnimalGlyph({
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
  const art = useMemo(() => animalArtTexture(animal, color), [animal, color]);
  const dot = useMemo(() => particleTexture(), []);
  const planeRef = useRef<THREE.Mesh>(null);
  const dustRef = useRef<THREE.Points>(null);

  const shape = ANIMAL_SHAPES[animal];
  const size = radius * 6.6;
  const phase = useMemo(() => Math.abs(worldPos.x * 1.7 + worldPos.z), [worldPos]);

  // a sparse 3D dust halo sampled from the figure's vertices, given depth
  const dust = useMemo(() => {
    if (!shape) return new Float32Array(0);
    const scale = radius * 3.0;
    const pts: number[] = [];
    let i = 1;
    for (const stroke of shape.strokes) {
      for (const [nx, ny] of stroke) {
        for (let k = 0; k < 2; k++) {
          const jx = (rand(i * 2.1) - 0.5) * 0.18;
          const jy = (rand(i * 3.7) - 0.5) * 0.18;
          const jz = (rand(i * 5.3) - 0.5) * 0.5;
          pts.push((nx + jx) * scale, (ny + jy) * scale, jz * scale);
          i++;
        }
      }
    }
    return new Float32Array(pts);
  }, [shape, radius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const d = camera.position.distanceTo(worldPos);
    const close = THREE.MathUtils.clamp(1 - (d - radius * 4) / 60, 0, 1);
    const vis = 0.5 + 0.5 * close;
    const twinkle = 0.88 + 0.12 * Math.sin(t * 2 + phase);
    if (planeRef.current)
      (planeRef.current.material as THREE.MeshBasicMaterial).opacity = vis * twinkle;
    if (dustRef.current)
      (dustRef.current.material as THREE.PointsMaterial).opacity = vis * 0.5 * twinkle;
  });

  if (!art) return null;

  return (
    <>
      <Billboard>
        <mesh ref={planeRef}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial
            map={art}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 0.34}
          map={dot}
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
