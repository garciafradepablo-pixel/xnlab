/**
 * Cinematic post-processing — the "metaverse AAA" grade. Bloom blooms the
 * luminous cores, thread beams and additive halos; a soft vignette frames the
 * viewport like a game camera; a whisper of film grain kills banding in the
 * deep-space gradients. Only mounted on capable devices (Settings · bloom);
 * low-power phones fall back to the cheaper additive-sprite glow.
 */
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.25}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.82}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.82} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
    </EffectComposer>
  );
}
