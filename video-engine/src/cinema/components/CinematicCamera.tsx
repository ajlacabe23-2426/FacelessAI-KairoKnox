import React from 'react';
import {cameraPose} from '../motion';

export const CinematicCamera: React.FC<{
  globalFrame: number;
  fps: number;
  depth: number;
  children: React.ReactNode;
}> = ({globalFrame, fps, depth, children}) => {
  const pose = cameraPose(globalFrame, fps, depth);
  return (
    <div style={{
      position: 'absolute', inset: -36,
      transformOrigin: 'center center',
      transform: 'translate3d(' + pose.x + 'px,' + pose.y + 'px,0) scale(' + pose.scale + ')',
      willChange: 'transform',
    }}>
      {children}
    </div>
  );
};
