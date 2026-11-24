import React from 'react';
import type {AudioBands, TelemetryPoint} from '../schema';
import {cubicBezier, clamp01, springFollow} from '../motion';

export const TelemetryHUD: React.FC<{
  telemetry: readonly TelemetryPoint[];
  accent: string;
  localFrame: number;
  fps: number;
  bands: AudioBands;
}> = ({telemetry, accent, localFrame, fps, bands}) => {
  const reveal = cubicBezier(clamp01((localFrame - 22) / 58));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 15, width: '100%'}}>
      {telemetry.map((point, index) => {
        const active = springFollow(localFrame, fps, 20 + index * 12);
        return (
          <div key={point.label} style={{
            border: '1px solid ' + accent + '5A', borderRadius: 21,
            background: 'linear-gradient(115deg,#10243BEF,#061426DE)',
            boxShadow: '0 15px 50px #0008,inset 0 1px 0 #B4F4FF1C',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '19px 27px', opacity: clamp01(active),
            transform: 'translate3d(' + (1 - active) * 54 + 'px,0,0)',
          }}>
            <span style={{fontSize: 21, letterSpacing: 2.4, color: '#9EB6CC', fontWeight: 800}}>{point.label}</span>
            <span style={{fontSize: 23, letterSpacing: 0.6, fontWeight: 800, color: accent}}>{point.value}</span>
          </div>
        );
      })}
      <div style={{
        width: '100%', marginTop: 12, borderRadius: 18, overflow: 'hidden',
        background: '#061325B8', border: '1px solid #B9D9F92A', padding: '17px 24px',
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 18, letterSpacing: 1.9, color: '#ACBCD0'}}>
          <span>SIGNAL MONITOR</span><span>{bands.bass || bands.mid || bands.treble ? 'AUDIO ENVELOPE' : 'DEMO SIGNAL'}</span>
        </div>
        <svg width="100%" height="104" viewBox="0 0 790 104" role="img" aria-label="Audio or demonstrative signal response">
          <defs><linearGradient id="trace-grad" x1="0" x2="1">
            <stop offset="0%" stopColor={accent} stopOpacity=".18"/>
            <stop offset="50%" stopColor={accent} stopOpacity="1"/>
            <stop offset="100%" stopColor={accent} stopOpacity=".48"/>
          </linearGradient></defs>
          <path d={Array.from({length: 80}, (_, i) => {
            const x = i * 10;
            const mod = 7 + (bands.bass * 28 + bands.mid * 14 + bands.treble * 8);
            const y = 53 + Math.sin((i * 0.40) - localFrame / fps * 2.1) * mod *
              (0.45 + 0.55 * Math.sin(i * 0.11) ** 2);
            return (i ? ' L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
          }).join('')}
          stroke="url(#trace-grad)" strokeWidth="3.5" fill="none"
          opacity={reveal} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="910" strokeDashoffset={910 * (1 - reveal)}/>
        </svg>
      </div>
    </div>
  );
};
