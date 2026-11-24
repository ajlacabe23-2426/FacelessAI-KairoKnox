import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CinematicCamera} from './CinematicCamera';
import {seededUnit} from '../motion';

export const ParallaxStage: React.FC<{
  globalFrame: number;
  fps: number;
  accent: string;
  children: React.ReactNode;
}> = ({globalFrame, fps, accent, children}) => {
  return (
    <AbsoluteFill style={{
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 22% 20%,#15314C 0%,#0A1225 44%,#02050D 100%)',
    }}>
      <CinematicCamera globalFrame={globalFrame} fps={fps} depth={0.30}>
        <AbsoluteFill style={{
          opacity: 0.19,
          backgroundImage: 'linear-gradient(#81CFF128 1px,transparent 1px),linear-gradient(90deg,#81CFF128 1px,transparent 1px)',
          backgroundSize: '74px 74px',
          filter: 'blur(1px)',
        }}/>
        <div style={{
          position: 'absolute', width: 1020, height: 1020, left: -490, top: 120,
          borderRadius: '50%', border: '2px solid ' + accent + '27',
          boxShadow: '0 0 95px ' + accent + '13,inset 0 0 160px #030710',
          filter: 'blur(2px)',
        }}/>
        <div style={{
          position: 'absolute', width: 840, height: 840, right: -430, bottom: 180,
          borderRadius: '50%', border: '2px solid #AEDCF32A',
          boxShadow: '0 0 110px #81CFF112', filter: 'blur(3px)',
        }}/>
      </CinematicCamera>
      <CinematicCamera globalFrame={globalFrame} fps={fps} depth={0.78}>
        <AbsoluteFill style={{
          background: 'radial-gradient(ellipse at 75% 28%, ' + accent + '0E, transparent 40%)',
          filter: 'blur(24px)',
        }}/>
        {children}
      </CinematicCamera>
      <CinematicCamera globalFrame={globalFrame} fps={fps} depth={1.52}>
        {Array.from({length: 37}, (_, i) => {
          const x = seededUnit(i * 142 + 11) * 1090;
          const y = seededUnit(i * 251 + 93) * 1940;
          const radius = 1.2 + seededUnit(i * 471 + 31) * 3.5;
          const drift = Math.sin(globalFrame / fps * (0.22 + seededUnit(i + 7) * 0.35) + i);
          return <div key={i} style={{
            position: 'absolute', left: x + drift * 12, top: y + drift * 18,
            width: radius * 2, height: radius * 2, borderRadius: '50%',
            background: i % 4 === 0 ? accent : '#BCD4E8',
            boxShadow: '0 0 9px ' + accent + '65',
            opacity: 0.19 + 0.25 * seededUnit(i + 822),
            filter: i % 3 ? 'blur(1.8px)' : 'blur(0.6px)',
          }}/>;
        })}
      </CinematicCamera>
    </AbsoluteFill>
  );
};
