/**
 * Renders an archetype animal as a luminous constellation around its body:
 *   · light lines tracing every stroke of the figure
 *   · a bright, near-white star at each stroke vertex (the "named" stars)
 *   · fine star-dust scattered along the strokes, with gentle z-depth so the
 *     figure has volume rather than reading as flat line-art
 * It billboards to stay legible from any orbit angle, twinkles softly, and
 * brightens as you approach — but keeps a visible floor so the animal always
 * reads (it is the entity's signature, not a hidden easter egg).
 */
import { useMemo, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMAL_SHAPES } from "./animal-shapes";
import { particleTexture } from "./textures";

// deterministic pseudo-random so the dust is stable across renders
function rand(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// gentle forward bulge → the figure curves toward the viewer at its centre
function depth(nx: number, ny: number): number {
  const r2 = Math.min((nx * nx + ny * ny) / 1.95, 1);
  return 0.22 * (1 - r2);
}

const DUST_PER_SEGMENT = 5;

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
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const keyRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  const shape = ANIMAL_SHAPES[animal];
  const scale = radius * 3.0;
  const phase = useMemo(() => Math.abs(worldPos.x * 1.7 + worldPos.z), [worldPos]);

  // a brightened, near-white tint for the key stars (real stars read white-hot)
  const starColor = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55),
    [color],
  );

  const { segments, keyStars, dust } = useMemo(() => {
    if (!shape)
      return {
        segments: new Float32Array(0),
        keyStars: new Float32Array(0),
        dust: new Float32Array(0),
      };

    const seg: number[] = [];
    const key: number[] = [];
    const dst: number[] = [];
    let di = 1;

    for (const stroke of shape.strokes) {
      for (let i = 0; i < stroke.length; i++) {
        const [nx, ny] = stroke[i];
        key.push(nx * scale, ny * scale, depth(nx, ny) * scale);

        if (i === stroke.length - 1) continue;
        const [ax, ay] = stroke[i];
        const [bx, by] = stroke[i + 1];
        // line segment
        seg.push(ax * scale, ay * scale, depth(ax, ay) * scale);
        seg.push(bx * scale, by * scale, depth(bx, by) * scale);
        // dust sampled along the segment, jittered for a nebulous trail
        for (let k = 1; k <= DUST_PER_SEGMENT; k++) {
          const t = (k - 0.5) / DUST_PER_SEGMENT;
          const jx = (rand(di * 2.1) - 0.5) * 0.12;
          const jy = (rand(di * 3.7) - 0.5) * 0.12;
          const jz = (rand(di * 5.3) - 0.5) * 0.42;
          const px = ax + (bx - ax) * t + jx;
          const py = ay + (by - ay) * t + jy;
          dst.push(px * scale, py * scale, (depth(px, py) + jz) * scale);
          di++;
        }
      }
    }
    return {
      segments: new Float32Array(seg),
      keyStars: new Float32Array(key),
      dust: new Float32Array(dst),
    };
  }, [shape, scale]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const d = camera.position.distanceTo(worldPos);
    // always visible (floor), brightening as the camera nears
    const close = THREE.MathUtils.clamp(1 - (d - radius * 4) / 60, 0, 1);
    const vis = 0.45 + 0.55 * close;
    const twinkle = 0.86 + 0.14 * Math.sin(t * 2 + phase);
    if (groupRef.current) groupRef.current.scale.setScalar(1 + 0.02 * Math.sin(t * 1.1 + phase));
    if (linesRef.current)
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = vis * 0.5 * twinkle;
    if (keyRef.current)
      (keyRef.current.material as THREE.PointsMaterial).opacity = Math.min(vis * twinkle, 1);
    if (dustRef.current)
      (dustRef.current.material as THREE.PointsMaterial).opacity = vis * 0.45 * twinkle;
  });

  if (!shape) return null;

  return (
    <Billboard>
      <group ref={groupRef}>
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

        {/* fine star-dust tracing the strokes */}
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dust, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={radius * 0.3}
            map={tex}
            color={color}
            transparent
            opacity={0.35}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* bright named stars at every vertex */}
        <points ref={keyRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[keyStars, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={radius * 0.66}
            map={tex}
            color={starColor}
            transparent
            opacity={0.95}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </Billboard>
  );
}
