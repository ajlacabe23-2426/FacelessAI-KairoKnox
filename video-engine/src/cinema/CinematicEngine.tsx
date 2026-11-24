import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {cinematicPlan} from './plan';
import type {AudioBands, CinemaPlan, CinematicBeat} from './schema';
import {audioBandsAt, durationOf, validateCinemaPlan} from './schema';
import {clamp01, cubicBezier, springEnter} from './motion';
import {CinematicCamera} from './components/CinematicCamera';
import {FilmGrainOverlay} from './components/FilmGrainOverlay';
import {FluidTransition} from './components/FluidTransition';
import {KineticText} from './components/KineticText';
import {ParallaxStage} from './components/ParallaxStage';
import {TelemetryHUD} from './components/TelemetryHUD';

export type CinematicEngineProps = {
  plan?: CinemaPlan;
  narrationFile?: string;
  bands?: readonly AudioBands[];
};

const Scene: React.FC<{
  beat: CinematicBeat;
  overlapFrames: number;
  fps: number;
  bands: readonly AudioBands[];
}> = ({beat, overlapFrames, fps, bands}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = beat.startFrame + localFrame;
  const energy = audioBandsAt(bands, globalFrame);
  const description = springEnter(localFrame, fps, 23);
  const graphProgress = cubicBezier(clamp01((localFrame - 40) / 110));
  return (
    <FluidTransition
      localFrame={localFrame}
      durationInFrames={beat.durationInFrames}
      overlapFrames={overlapFrames}
    >
      <ParallaxStage globalFrame={globalFrame} fps={fps} accent={beat.accent}>
        <CinematicCamera globalFrame={globalFrame} fps={fps} depth={0.16}>
          <div style={{
            position: 'absolute', left: 92, top: 184, right: 92,
            color: beat.accent, fontSize: 25, fontWeight: 800, letterSpacing: 3.1,
            fontFamily: 'Arial,Helvetica,sans-serif',
          }}>{beat.eyebrow}</div>
          <div style={{
            position: 'absolute', top: 340, left: 90, right: 74,
          }}>
            <KineticText
              text={beat.headline}
              localFrame={localFrame}
              globalFrame={globalFrame}
              fps={fps}
              accent={beat.accent}
            />
            <div style={{
              marginTop: 56, maxWidth: 850, fontSize: 38, lineHeight: 1.34,
              color: '#CAD9EA', fontFamily: 'Arial,Helvetica,sans-serif',
              opacity: clamp01(description),
              transform: 'translate3d(0,' + (1 - description) * 28 + 'px,0)',
            }}>{beat.explanation}</div>
          </div>
          <div style={{
            position: 'absolute', left: 88, right: 88, bottom: 265,
          }}>
            <TelemetryHUD
              telemetry={beat.telemetry}
              accent={beat.accent}
              localFrame={localFrame}
              fps={fps}
              bands={energy}
            />
          </div>
          <div style={{
            position: 'absolute', left: 90, right: 90, bottom: 146, height: 3,
            background: '#6C99B84B',
          }}>
            <div style={{
              height: '100%', width: (graphProgress * 100).toFixed(3) + '%',
              background: beat.accent, boxShadow: '0 0 24px ' + beat.accent,
            }}/>
          </div>
          <div style={{
            position: 'absolute', left: 90, bottom: 94, color: '#96A9BF',
            fontSize: 19, letterSpacing: 2.2, fontFamily: 'Arial,Helvetica,sans-serif',
          }}>KAIRO KNOX  /  ORIGINAL CODED VISUAL</div>
          <div style={{
            position: 'absolute', right: 90, bottom: 94, color: '#96A9BF',
            fontSize: 19, letterSpacing: 1.6, fontFamily: 'Arial,Helvetica,sans-serif',
          }}>ILLUSTRATIVE DEMO</div>
        </CinematicCamera>
      </ParallaxStage>
    </FluidTransition>
  );
};

export const CinematicEngine: React.FC<CinematicEngineProps> = ({
  plan = cinematicPlan, narrationFile = '', bands = [],
}) => {
  validateCinemaPlan(plan);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (fps !== plan.fps) throw new Error('Composition FPS does not match the plan.');
  const accent = [...plan.beats].reverse().find((beat) => frame >= beat.startFrame)?.accent ??
    plan.beats[0].accent;
  return (
    <AbsoluteFill style={{background: '#030712'}}>
      {plan.beats.map((beat) => (
        <Sequence
          key={beat.id}
          from={beat.startFrame}
          durationInFrames={beat.durationInFrames}
          layout="none"
        >
          <Scene beat={beat} overlapFrames={plan.overlapFrames} fps={fps} bands={bands}/>
        </Sequence>
      ))}
      <FilmGrainOverlay
        globalFrame={frame}
        fps={fps}
        accent={accent}
        durationInFrames={durationOf(plan)}
      />
      {narrationFile ? <Audio src={staticFile(narrationFile)} /> : null}
    </AbsoluteFill>
  );
};
