import React from 'react';
import {springEnter, springFollow, cameraSpeed} from '../motion';

export const KineticText: React.FC<{
  text: string;
  localFrame: number;
  globalFrame: number;
  fps: number;
  accent: string;
}> = ({text, localFrame, globalFrame, fps, accent}) => {
  const chroma = Math.min(2.5, Math.max(0, (cameraSpeed(globalFrame, fps) - 6) / 9));
  return (
    <div style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: 900, fontSize: 105,
      lineHeight: 1.07, letterSpacing: -4,
      color: '#F5FBFF',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      maxWidth: 920,
      textShadow: (-chroma) + 'px 0 #FF668A,' + chroma + 'px 0 ' + accent + ',0 0 37px #60CEEC19',
    }}>
      {Array.from(text).map((letter, index) => {
        const first = springEnter(localFrame, fps, index * 1.75);
        const follow = springFollow(localFrame, fps, index * 1.75 + 6);
        const angle = (1 - first) * -13 + (follow - first) * 6;
        return (
          <span key={index} style={{
            display: letter === '\n' ? 'block' : 'inline-block',
            whiteSpace: 'pre',
            opacity: Math.min(1, Math.max(0, first)),
            transform: 'translate3d(0,' + ((1 - first) * 84 + (follow - first) * 24) +
              'px,0) rotate(' + angle + 'deg)',
            color: index >= text.length - 7 ? accent : '#F5FBFF',
          }}>{letter === '\n' ? '\u00A0' : letter}</span>
        );
      })}
    </div>
  );
};
