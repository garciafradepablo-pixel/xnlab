/**
 * The archetype animal as a true 3D NEBULA: a volumetric cloud of particles in
 * the shape of the creature, with real depth in Z, so as the camera orbits the
 * animal has body and dimension — not a flat picture facing the lens. A soft
 * diffuse cloud forms the nebula; brighter stars mark the joints. It twinkles
 * and brightens as the camera nears — the entity's always-readable signature.
 *
 * If the entity carries its own image (meta.imageUrl) we billboard that bespoke
 * illustration instead, keeping the procedural 3D nebula as the fallback.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMAL_SHAPES } from "./animal-shapes";
import { particleTexture } from "./textures";

function rand(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
/** Triangular ≈ gaussian noise in [-1,1]. */
function gauss(i: number): number {
  return rand(i * 1.7) - 0.5 + (rand(i * 3.3) - 0.5);
}

export default function AnimalGlyph({
  animal,
  color,
  radius,
  worldPos,
  imageUrl,
}: {
  animal: string;
  color: string;
  radius: number;
  worldPos: THREE.Vector3;
  imageUrl?: string;
}) {
  const camera = useThree((s) => s.camera);
  const dot = useMemo(() => particleTexture(), []);
  const shape = ANIMAL_SHAPES[animal];

  const cloudRef = useRef<THREE.Points>(null);
  const starRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const planeRef = useRef<THREE.Mesh>(null);

  const phase = useMemo(() => Math.abs(worldPos.x * 1.7 + worldPos.z), [worldPos]);
  const starColor = useMemo(
    () => "#" + new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55).getHexString(),
    [color],
  );

  // optional bespoke image overrides the procedural nebula (billboarded 2D)
  const [image, setImage] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      imageUrl,
      (tex) => {
        if (!alive) return tex.dispose();
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setImage(tex);
      },
      undefined,
      () => alive && setImage(null),
    );
    return () => {
      alive = false;
    };
  }, [imageUrl]);

  // volumetric point cloud: dense diffuse body + bright joint stars + the
  // constellation lines that join the stars into the figure (the zodiac read),
  // all with Z depth so it has volume when you orbit.
  const { body, stars, lines } = useMemo(() => {
    if (!shape)
      return {
        body: new Float32Array(0),
        stars: new Float32Array(0),
        lines: new Float32Array(0),
      };
    const scale = radius * 2.4;
    const sxy = scale * 0.05; // skeleton fuzz in plane
    const zs = scale * 0.22; // depth → real volume when orbiting
    const body: number[] = [];
    let i = 1;
    for (const stroke of shape.strokes) {
      for (let s = 0; s < stroke.length - 1; s++) {
        const [ax, ay] = stroke[s];
        const [bx, by] = stroke[s + 1];
        const steps = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) * 26));
        for (let t = 0; t < steps; t++) {
          const f = t / steps;
          const x = (ax + (bx - ax) * f) * scale;
          const y = (ay + (by - ay) * f) * scale;
          for (let k = 0; k < 3; k++) {
            i++;
            body.push(x + gauss(i) * sxy * 2, y + gauss(i * 2.1) * sxy * 2, gauss(i * 3.7) * zs * 2);
          }
        }
      }
    }
    const stars: number[] = [];
    const seen = new Set<string>();
    let j = 1;
    for (const stroke of shape.strokes)
      for (const [nx, ny] of stroke) {
        const key = `${nx},${ny}`;
        if (seen.has(key)) continue;
        seen.add(key);
        j++;
        stars.push(nx * scale, ny * scale, gauss(j * 5.9) * zs);
      }
    // constellation skeleton: a glowing line per stroke segment (kept near the
    // plane so the figure stays legible head-on, the cloud carries the depth)
    const lines: number[] = [];
    for (const stroke of shape.strokes)
      for (let s = 0; s < stroke.length - 1; s++) {
        const [ax, ay] = stroke[s];
        const [bx, by] = stroke[s + 1];
        lines.push(ax * scale, ay * scale, 0, bx * scale, by * scale, 0);
      }
    return {
      body: new Float32Array(body),
      stars: new Float32Array(stars),
      lines: new Float32Array(lines),
    };
  }, [shape, radius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const d = camera.position.distanceTo(worldPos);
    const close = THREE.MathUtils.clamp(1 - (d - radius * 4) / 60, 0, 1);
    // the figure is the body's signature → readable from afar, richer up close
    const vis = 0.82 + 0.18 * close;
    const twinkle = 0.85 + 0.15 * Math.sin(t * 2 + phase);
    if (cloudRef.current)
      (cloudRef.current.material as THREE.PointsMaterial).opacity = vis * 0.42 * twinkle;
    if (lineRef.current)
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = vis * 0.6 * twinkle;
    if (starRef.current)
      (starRef.current.material as THREE.PointsMaterial).opacity = vis * 0.98 * twinkle;
    if (planeRef.current)
      (planeRef.current.material as THREE.MeshBasicMaterial).opacity = vis * twinkle;
  });

  // bespoke image → billboarded sprite
  if (image) {
    const size = radius * 6.6;
    return (
      <Billboard>
        <mesh ref={planeRef}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial
            map={image}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    );
  }

  if (!shape) return null;

  return (
    <group>
      <points ref={cloudRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[body, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 0.5}
          map={dot}
          color={color}
          transparent
          opacity={0.34}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={starColor}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
      <points ref={starRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={radius * 0.9}
          map={dot}
          color={starColor}
          transparent
          opacity={0.95}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
