import React from 'react';
import {AbsoluteFill} from 'remotion';
import {cubicBezier, seededUnit} from '../motion';

const grainSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="180"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency=".76" numOctaves="3" seed="17" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="180" height="180" filter="url(%23n)" opacity=".64"/%3E%3C/svg%3E';

export const FilmGrainOverlay: React.FC<{
  globalFrame: number;
  fps: number;
  accent: string;
  durationInFrames: number;
}> = ({globalFrame, fps, accent, durationInFrames}) => {
  const offsetX = Math.floor(seededUnit(globalFrame + 723) * 180);
  const offsetY = Math.floor(seededUnit(globalFrame + 301) * 180);
  const span = 140;
  const sweepPeriod = fps * 8;
  const sweepProgress = cubicBezier((globalFrame % sweepPeriod) / sweepPeriod, 0.37, 0, 0.63, 1);
  const beamLeft = -520 + sweepProgress * 2020;
  const tailOpacity = cubicBezier(Math.max(0, 1 - globalFrame / Math.max(1, durationInFrames)), 0.22, 1, 0.36, 1);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{
        position: 'absolute', left: beamLeft, top: -180, height: '125%', width: span,
        transform: 'rotate(-19deg)', filter: 'blur(72px)',
        background: 'linear-gradient(90deg,transparent,' + accent + '24,transparent)',
        opacity: 0.64 * tailOpacity,
        mixBlendMode: 'screen',
      }}/>
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 48% 42%, transparent 28%, rgba(0,0,0,.30) 72%, rgba(0,0,0,.79) 100%)',
      }}/>
      <AbsoluteFill style={{
        opacity: 0.105,
        backgroundImage: 'url("' + grainSvg + '")',
        backgroundPosition: offsetX + 'px ' + offsetY + 'px',
        mixBlendMode: 'screen',
      }}/>
      <AbsoluteFill style={{
        opacity: 0.14, background: 'radial-gradient(ellipse at 55% 48%, transparent 57%, #020610 100%)',
      }}/>
    </AbsoluteFill>
  );
};
