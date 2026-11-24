import {spring} from 'remotion';

export const SPRING_ENTER = Object.freeze({stiffness: 138, damping: 17, mass: 0.88});
export const SPRING_FOLLOW = Object.freeze({stiffness: 95, damping: 19, mass: 1.16});

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

const cubic = (a: number, b: number, t: number): number => {
  const u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
};

export const cubicBezier = (
  progress: number, x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1,
): number => {
  const target = clamp01(progress);
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    if (cubic(x1, x2, mid) < target) low = mid;
    else high = mid;
  }
  return cubic(y1, y2, (low + high) / 2);
};

export const springEnter = (frame: number, fps: number, delay = 0): number =>
  spring({frame: frame - delay, fps, config: SPRING_ENTER, durationInFrames: 40});

export const springFollow = (frame: number, fps: number, delay = 0): number =>
  spring({frame: frame - delay, fps, config: SPRING_FOLLOW, durationInFrames: 52});

export const seededUnit = (seed: number): number => {
  let value = (seed * 1664525 + 1013904223) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  return (value >>> 0) / 4294967295;
};

export const cameraPose = (globalFrame: number, fps: number, depth: number) => {
  const t = globalFrame / fps;
  return {
    x: depth * (12 * Math.sin(t * 0.54) + 7 * Math.sin(t * 0.23 + 0.8)),
    y: depth * (13 * Math.cos(t * 0.43) + 4 * Math.sin(t * 0.31)),
    scale: 1 + depth * (0.036 + 0.008 * Math.cos(t * 0.29)),
  };
};

export const cameraSpeed = (globalFrame: number, fps: number): number => {
  const a = cameraPose(globalFrame, fps, 1);
  const b = cameraPose(globalFrame - 1, fps, 1);
  return Math.hypot(a.x - b.x, a.y - b.y) * fps;
};
