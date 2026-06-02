/**
 * Tiny shared channel for camera orientation. The scene writes it every frame
 * (cheap, no React re-render); the DOM compass reads it on its own rAF loop.
 * This keeps the per-frame camera value out of the store (which would thrash).
 */
export const heading = { yaw: 0, pitch: 0 };
