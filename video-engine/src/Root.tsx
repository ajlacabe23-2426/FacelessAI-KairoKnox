import React from 'react';
import {Composition} from 'remotion';
import {MicroLearningPilot} from './MicroLearningPilot';
import {SignalCutPilot} from './SignalCutPilot';
import {CinematicEngine} from './cinema/CinematicEngine';
import {cinematicPlan} from './cinema/plan';
import {durationOf, validateCinemaPlan} from './cinema/schema';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="MicroLearningPilot"
    component={MicroLearningPilot}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={{narrationFile: ''}}
  />
  <Composition
    id="SignalCutPilot"
    component={SignalCutPilot}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={{narrationFile: ''}}
  />
  <Composition
    id="KairoCinematic60"
    component={CinematicEngine}
    width={1080}
    height={1920}
    fps={60}
    durationInFrames={durationOf(cinematicPlan)}
    defaultProps={{plan: cinematicPlan, narrationFile: '', bands: []}}
    calculateMetadata={({props}) => {
      const possiblePlan: unknown = props.plan;
      const plan = possiblePlan && typeof possiblePlan === 'object' && 'beats' in possiblePlan
        ? possiblePlan as typeof cinematicPlan
        : cinematicPlan;
      validateCinemaPlan(plan);
      return {durationInFrames: durationOf(plan)};
    }}
  />
  </>
);
