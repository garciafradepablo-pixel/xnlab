/**
 * A connection is not a straight line — it's a neural thread: an organic curve
 * (root / mycelium) carrying a pulse of energy from one end to the other. Colour
 * encodes meaning (see THREAD_COLORS).
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { THREAD_COLORS, type ThreadType, type Vec3 } from "../types/domain";

export default function NeuralThread({
  from,
  to,
  type,
  seed,
  lowPower,
}: {
  from: Vec3;
  to: Vec3;
  type: ThreadType;
  seed: number;
  lowPower: boolean;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const color = THREAD_COLORS[type];

  const curve = useMemo(() => {
    const a = new THREE.Vector3(from.x, from.y, from.z);
    const b = new THREE.Vector3(to.x, to.y, to.z);
    const dir = b.clone().sub(a);
    const len = dir.length() || 1;
    // a perpendicular offset gives the thread its organic sag/curl
    const perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    const up = dir.clone().cross(perp).normalize();
    const bow = len * 0.18;
    const wobble = (Math.sin(seed) * 0.5 + 0.5) * bow;
    const p1 = a
      .clone()
      .lerp(b, 0.33)
      .add(perp.clone().multiplyScalar(bow * (seed % 1 - 0.5)))
      .add(up.clone().multiplyScalar(wobble));
    const p2 = a
      .clone()
      .lerp(b, 0.66)
      .add(perp.clone().multiplyScalar(-bow * ((seed * 1.7) % 1 - 0.5)))
      .add(up.clone().multiplyScalar(-wobble * 0.6));
    return new THREE.CatmullRomCurve3([a, p1, p2, b]);
  }, [from.x, from.y, from.z, to.x, to.y, to.z, seed]);

  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, lowPower ? 20 : 40, 0.06, 6, false),
    [curve, lowPower],
  );

  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (state.clock.elapsedTime * 0.25 + seed) % 1;
    const p = curve.getPointAt(t);
    pulseRef.current.position.copy(p);
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
