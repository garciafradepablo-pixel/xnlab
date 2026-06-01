/**
 * The R3F canvas. Full viewport, dpr capped at 2 for mobile, adaptive
 * performance scaling. The canvas is the protagonist; the HUD floats above it.
 */
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { useUniverse } from "../store/universe";
import Scene from "./Scene";
import Effects from "./Effects";

export default function CosmosCanvas() {
  const lowPower = useUniverse((s) => s.lowPower);
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 6, 34], fov: 55, near: 0.1, far: 400 }}
    >
      <Scene />
      {/* Bloom only where the GPU can afford it. */}
      {!lowPower && <Effects />}
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}
