/**
 * Real bloom over the luminous cores and additive halos — the "glow en los
 * cuerpos" the brief asks for. Only mounted on capable devices; low-power
 * phones fall back to the cheaper additive-sprite glow and skip this pass.
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
    </EffectComposer>
  );
}
