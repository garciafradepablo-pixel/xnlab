/**
 * One entity → one celestial body. Form follows life-state; size follows
 * expansion capacity (computed upstream). Interactions:
 *   navigate : tap = select + inspector · long-press = zoom into child cosmos
 *   weave    : tap = pick thread endpoint
 *   move     : drag to reposition (orbit disabled during the drag)
 *
 * The body only READS the store and emits actions; it never mutates state by
 * any other path.
 */
import { useMemo, useRef } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Entity } from "../types/domain";
import { useUniverse } from "../store/universe";
import { glowTexture, particleTexture } from "./textures";
import { useControlsGate } from "./controls-context";

const LONG_PRESS_MS = 480;
const TAP_MAX_MS = 260;

function nebulaCloud(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

export default function CelestialBody({
  entity,
  radius,
}: {
  entity: Entity;
  radius: number;
}) {
  const camera = useThree((s) => s.camera);
  const { setOrbitEnabled } = useControlsGate();

  const mode = useUniverse((s) => s.mode);
  const selectedId = useUniverse((s) => s.selectedId);
  const weaveFromId = useUniverse((s) => s.weaveFromId);
  const select = useUniverse((s) => s.select);
  const tapForWeave = useUniverse((s) => s.tapForWeave);
  const enterChild = useUniverse((s) => s.enterChildUniverse);
  const moveEntity = useUniverse((s) => s.moveEntity);
  const commitMove = useUniverse((s) => s.commitMove);

  const selected = selectedId === entity.id;
  const pending = weaveFromId === entity.id;

  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const diskRef = useRef<THREE.Mesh>(null);

  // gesture bookkeeping
  const downAt = useRef(0);
  const downPos = useRef<[number, number]>([0, 0]);
  const dragging = useRef(false);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedFar = useRef(false);

  const color = entity.archetype.color;
  const glow = useMemo(() => glowTexture(), []);
  const pTex = useMemo(() => particleTexture(), []);
  const nebula = useMemo(
    () => nebulaCloud(entity.archetype.animal === "none" ? 60 : 140, radius * 1.7),
    [entity.archetype.animal, radius],
  );
  const seed = useMemo(() => {
    let h = 0;
    for (const ch of entity.id) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return h / 997;
  }, [entity.id]);

  const isGalaxy = entity.state === "galaxy";
  const isSystem = entity.state === "system";
  const isBlackHole = entity.state === "blackhole";
  const isNebula = entity.state === "nebula";
  const dim = entity.state === "absorbed";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      // protostar flickers; everything breathes a little
      const flick = entity.state === "protostar" ? 0.15 * Math.sin(t * 6 + seed * 9) : 0;
      const breathe = 1 + 0.03 * Math.sin(t * 1.3 + seed * 6) + flick;
      coreRef.current.scale.setScalar(breathe);
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = t * 0.05 + seed * 6;
      // archetype only insinuates itself when the camera is close
      const d = camera.position.distanceTo(
        groupRef.current?.position ?? new THREE.Vector3(),
      );
      const close = THREE.MathUtils.clamp(1 - (d - radius * 3) / 30, 0, 1);
      const mat = nebulaRef.current.material as THREE.PointsMaterial;
      mat.opacity = (entity.archetype.animal === "none" ? 0.18 : 0.5) * close;
    }
    if (diskRef.current) diskRef.current.rotation.z = t * 0.6;
  });

  // ── gestures ──────────────────────────────────────────────────────────────
  const clearLong = () => {
    if (longTimer.current) {
      clearTimeout(longTimer.current);
      longTimer.current = null;
    }
  };

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    downAt.current = performance.now();
    downPos.current = [e.clientX, e.clientY];
    movedFar.current = false;

    if (mode === "move") {
      dragging.current = true;
      setOrbitEnabled(false);
      return;
    }
    if (mode === "navigate") {
      longTimer.current = setTimeout(() => {
        longTimer.current = null;
        if (!movedFar.current) enterChild(entity.id);
      }, LONG_PRESS_MS);
    }
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const dx = e.clientX - downPos.current[0];
    const dy = e.clientY - downPos.current[1];
    if (Math.hypot(dx, dy) > 8) {
      movedFar.current = true;
      clearLong();
    }
    if (dragging.current && groupRef.current) {
      // project the pointer ray onto a plane facing the camera through the body
      const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        normal,
        groupRef.current.position,
      );
      const hit = new THREE.Vector3();
      if (e.ray.intersectPlane(plane, hit)) {
        moveEntity(entity.id, { x: hit.x, y: hit.y, z: hit.z });
      }
    }
  };

  const onUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    clearLong();
    const dt = performance.now() - downAt.current;
    if (dragging.current) {
      dragging.current = false;
      setOrbitEnabled(true);
      commitMove(entity.id);
      return;
    }
    const isTap = dt < TAP_MAX_MS && !movedFar.current;
    if (!isTap) return;
    if (mode === "weave") tapForWeave(entity.id);
    else select(entity.id);
  };

  // ── visuals by state ────────────────────────────────────────────────────
  const coreColor = isBlackHole ? "#05030a" : color;
  const emissive = isBlackHole ? "#1a0030" : color;
  const emissiveIntensity =
    entity.state === "star" || isSystem
      ? 1.6
      : entity.state === "protostar"
        ? 1.1
        : isGalaxy
          ? 1.2
          : isNebula
            ? 0.4
            : 0.8;

  return (
    <group
      ref={groupRef}
      position={[entity.position.x, entity.position.y, entity.position.z]}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* additive halo (fake bloom) */}
      <Billboard>
        <mesh scale={radius * (selected ? 6 : 4.4)}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glow}
            color={color}
            transparent
            opacity={dim ? 0.12 : isNebula ? 0.28 : 0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {/* core (hidden for pure nebula — it has no defined core) */}
      {!isNebula && (
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[radius, isGalaxy ? 3 : 2]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={0.35}
            metalness={0.2}
            transparent
            opacity={dim ? 0.5 : 1}
          />
        </mesh>
      )}

      {/* archetype nebula / particle storm — energy, never a logo */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebula, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isGalaxy ? 0.5 : 0.32}
          map={pTex}
          color={color}
          transparent
          opacity={0.25}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* system: an orbiting body to read "produces subentities" */}
      {isSystem && (
        <mesh position={[radius * 2.2, 0, 0]}>
          <sphereGeometry args={[radius * 0.22, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* black hole: rotating accretion disk */}
      {isBlackHole && (
        <Billboard>
          <mesh ref={diskRef}>
            <ringGeometry args={[radius * 1.3, radius * 3.2, 48]} />
            <meshBasicMaterial
              color="#ff9a3c"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Billboard>
      )}

      {/* selection / pending-weave ring */}
      {(selected || pending) && (
        <Billboard>
          <mesh>
            <ringGeometry args={[radius * 1.5, radius * 1.7, 48]} />
            <meshBasicMaterial
              color={pending ? "#ffffff" : color}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      )}

      {/* DOM label (reliable + crisp; uses our CSS fonts) */}
      <Html
        center
        position={[0, radius * 1.9 + 0.6, 0]}
        pointerEvents="none"
        distanceFactor={18}
        zIndexRange={[20, 0]}
      >
        <div className={`body-label ${selected ? "is-selected" : ""}`}>
          {entity.name}
        </div>
      </Html>
    </group>
  );
}
