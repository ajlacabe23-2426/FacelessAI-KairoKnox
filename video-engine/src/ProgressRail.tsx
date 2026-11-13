import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

/** Deterministic coded timeline indicator (no external media or ticker). */
export const ProgressRail: React.FC<{accent:string}> = ({accent}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = Math.max(0, Math.min(1, (frame+1)/durationInFrames));
  return (
    <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:0,height:11,background:'#19263f',pointerEvents:'none'}}>
      <div style={{
        height:'100%',width:`${progress*100}%`,background:accent,
        boxShadow:`0 0 24px ${accent}`,borderRadius:7
      }}/>
    </div>
  );
};
