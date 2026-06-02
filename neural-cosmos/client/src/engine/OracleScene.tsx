/**
 * Oracle view — the contemplative sky. Instead of the galaxy map, every company
 * is cast onto a surrounding celestial sphere as its constellation, and you sit
 * inside it and look around (slow auto-drift) "reading the companies in the
 * stars". Tap a constellation to inspect it.
 *
 * Reuses the same proven primitives (points, constellations, OrbitControls,
 * Html) as the galaxy scene — only the layout and mood change.
 */
import { useEffect, useMemo } from "react";
import { Billboard, Html, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverse } from "../store/universe";
import { glowTexture } from "./textures";
import AnimalGlyph from "./AnimalGlyph";
import Constellation from "./Constellation";
import Starfield from "./Starfield";

const SHELL = 42;

/** Even spread over a sphere (Fibonacci) so constellations don't clump. */
function dome(i: number, n: number): THREE.Vector3 {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi) * 0.7, // flatten vertically — more "horizon sky" than full ball
    Math.sin(phi) * Math.sin(theta),
  ).multiplyScalar(SHELL);
}

function OracleBody({
  pos,
  color,
  animal,
  name,
  role,
  selected,
  onSelect,
}: {
  pos: THREE.Vector3;
  color: string;
  animal: string;
  name: string;
  role: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const glow = useMemo(() => glowTexture(), []);
  const hasAnimal = animal !== "none";
  const r = selected ? 2.6 : 2.1;

  return (
    <group
      position={pos}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* generous invisible hit target */}
      <mesh visible={false}>
        <sphereGeometry args={[r * 2.4, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* a bright guide star */}
      <Billboard>
        <mesh scale={r * 2.2}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glow}
            color={color}
            transparent
            opacity={selected ? 0.8 : 0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {hasAnimal ? (
        <AnimalGlyph animal={animal} color={color} radius={r} worldPos={pos} />
      ) : (
        <Constellation radius={r * 0.7} color={color} />
      )}

      <Html center position={[0, r * 3.1, 0]} pointerEvents="none" distanceFactor={26}>
        <div className={`oracle-label ${selected ? "is-selected" : ""}`}>
          {name}
          {role && <span className="oracle-label-role">{role}</span>}
        </div>
      </Html>
    </group>
  );
}

export default function OracleScene() {
  const camera = useThree((s) => s.camera);
  const entities = useUniverse((s) => s.entities);
  const lowPower = useUniverse((s) => s.lowPower);
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);

  // sit the viewer inside the sphere
  useEffect(() => {
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, -1);
  }, [camera]);

  const placed = useMemo(
    () => entities.map((e, i) => ({ e, pos: dome(i, Math.max(entities.length, 1)) })),
    [entities],
  );

  return (
    <>
      <color attach="background" args={["#03030a"]} />
      <fog attach="fog" args={["#05050e", 30, 90]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#2a2d55", "#04040a", 0.6]} />

      <Starfield lowPower={lowPower} />

      {/* the oracle's eye — a faint focal glow at the centre */}
      <Billboard>
        <mesh scale={6}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glowTexture()}
            color="#b06cff"
            transparent
            opacity={0.12}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {placed.map(({ e, pos }) => (
        <OracleBody
          key={e.id}
          pos={pos}
          color={e.archetype.color}
          animal={e.archetype.animal}
          name={e.name}
          role={e.meta?.role ?? ""}
          selected={selectedId === e.id}
          onSelect={() => select(e.id)}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={-0.35}
        autoRotate
        autoRotateSpeed={0.25}
        minDistance={2}
        maxDistance={30}
        target={[0, 0, 0]}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
    </>
  );
}
