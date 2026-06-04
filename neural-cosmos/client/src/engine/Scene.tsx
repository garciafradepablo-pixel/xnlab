/**
 * The scene reads the store and renders it. It owns the OrbitControls (touch-
 * calibrated), camera focus easing, the 3D orientation gizmo, and the
 * star/fog backdrop. It dispatches nothing except through store actions invoked
 * by the bodies themselves.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverse } from "../store/universe";
import { computeRadius } from "../store/derive";
import { ControlsContext } from "./controls-context";
import { heading } from "./heading";
import Starfield from "./Starfield";
import CelestialBody from "./CelestialBody";
import NeuralThread from "./NeuralThread";

/** The slice of OrbitControls the focus rig touches. */
interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

/** Eases the orbit target toward the focused entity (fly-to on select). */
function FocusRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const focusId = useUniverse((s) => s.focusId);
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!controls || !focusId) return;
    const e = useUniverse.getState().entities.find((x) => x.id === focusId);
    if (!e) return;
    target.current.set(e.position.x, e.position.y, e.position.z);
    controls.target.lerp(target.current, 0.08);
    const dist = camera.position.distanceTo(controls.target);
    if (dist > 26) {
      const dir = camera.position.clone().sub(controls.target).setLength(22);
      camera.position.lerp(controls.target.clone().add(dir), 0.04);
    }
    controls.update();
  });
  return null;
}

/** Publishes camera yaw/pitch each frame for the DOM compass to read. */
function HeadingProbe() {
  const camera = useThree((s) => s.camera);
  const dir = useRef(new THREE.Vector3());
  useFrame(() => {
    camera.getWorldDirection(dir.current);
    heading.yaw = Math.atan2(dir.current.x, dir.current.z);
    heading.pitch = Math.asin(THREE.MathUtils.clamp(dir.current.y, -1, 1));
  });
  return null;
}

export default function Scene() {
  const entities = useUniverse((s) => s.entities);
  const threads = useUniverse((s) => s.threads);
  const lowPower = useUniverse((s) => s.lowPower);
  const selectedId = useUniverse((s) => s.selectedId);

  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const gate = useMemo(() => ({ setOrbitEnabled }), []);

  // index positions so threads can read both endpoints cheaply
  const posById = useMemo(() => {
    const m = new Map<string, (typeof entities)[number]["position"]>();
    for (const e of entities) m.set(e.id, e.position);
    return m;
  }, [entities]);

  const radiusOf = useCallback(
    (e: (typeof entities)[number]) => computeRadius(e, entities, threads),
    [entities, threads],
  );

  return (
    <ControlsContext.Provider value={gate}>
      <color attach="background" args={["#04040a"]} />
      <fog attach="fog" args={["#06060f", 60, 280]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={1.2} distance={120} decay={1.4} />
      <hemisphereLight args={["#23264d", "#020208", 0.5]} />

      <Starfield lowPower={lowPower} />

      {threads.map((t) => {
        const from = posById.get(t.fromId);
        const to = posById.get(t.toId);
        if (!from || !to) return null;
        // a selected node lights up its own synapses and dims the rest
        const active =
          selectedId != null &&
          (t.fromId === selectedId || t.toId === selectedId);
        const dimmed = selectedId != null && !active;
        return (
          <NeuralThread
            key={t.id}
            from={from}
            to={to}
            type={t.type}
            seed={t.seed}
            lowPower={lowPower}
            active={active}
            dimmed={dimmed}
          />
        );
      })}

      {entities.map((e) => (
        <CelestialBody key={e.id} entity={e} radius={radiusOf(e)} />
      ))}

      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        zoomSpeed={0.9}
        panSpeed={0.7}
        minDistance={4}
        maxDistance={160}
        // one finger orbits, pinch (two fingers) dollies + pans — the native feel
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <FocusRig />
      <HeadingProbe />

      <GizmoHelper alignment="bottom-left" margin={[64, 96]}>
        <GizmoViewport
          axisColors={["#ff5470", "#3ddc84", "#4ea6ff"]}
          labelColor="#eef0ff"
          hideNegativeAxes={false}
        />
      </GizmoHelper>
    </ControlsContext.Provider>
  );
}
