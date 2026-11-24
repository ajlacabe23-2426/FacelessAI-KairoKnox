import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, cubicBezier} from '../motion';

export const FluidTransition: React.FC<{
  localFrame: number;
  durationInFrames: number;
  overlapFrames: number;
  children: React.ReactNode;
}> = ({localFrame, durationInFrames, overlapFrames, children}) => {
  const entry = cubicBezier(clamp01(localFrame / overlapFrames), 0.33, 0, 0.67, 1);
  const exit = cubicBezier(
    clamp01((localFrame - (durationInFrames - overlapFrames)) / overlapFrames),
    0.33, 0, 0.67, 1,
  );
  const opacity = entry * (1 - exit);
  const x = 82 * (1 - entry) - 82 * exit;
  const y = -18 * (1 - entry) - 18 * exit;
  return (
    <AbsoluteFill style={{
      opacity, transform: 'translate3d(' + x + 'px,' + y + 'px,0)',
      willChange: 'transform, opacity', overflow: 'hidden',
    }}>
      {children}
    </AbsoluteFill>
  );
};
