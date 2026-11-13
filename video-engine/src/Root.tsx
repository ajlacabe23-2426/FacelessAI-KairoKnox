import React from 'react';
import {Composition} from 'remotion';
import {MicroLearningPilot} from './MicroLearningPilot';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MicroLearningPilot"
    component={MicroLearningPilot}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={{narrationFile: ''}}
  />
);
