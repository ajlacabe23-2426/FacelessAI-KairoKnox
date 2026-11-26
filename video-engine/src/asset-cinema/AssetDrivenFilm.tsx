import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AssetFilm, AssetShot} from './types';
import {assertFilmShape} from './types';
import {cameraAt, clamp01, ease, focusBlur, layerAt, lerp, lightSweepX} from './motion';

const font='Arial, Helvetica, sans-serif';
const Scene: React.FC<{shot: AssetShot; offset: number; accent: string; strict: boolean}> = ({shot,offset,accent,strict}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const globalFrame=offset+frame;
  const cam=cameraAt(shot.camera.from,shot.camera.to,frame,shot.durationFrames);
  const plane=lerp(shot.focus.from,shot.focus.to,ease(frame/(shot.durationFrames-1)));
  const missing=shot.layers.filter(l=>l.rights.status!=='cleared');
  // Production never silently substitutes missing assets with generic graphics.
  if (strict && missing.length) throw new Error('Asset/rights preflight failed for '+shot.id);
  const inFade=ease(clamp01(frame/30));
  const outFade=ease(clamp01((shot.durationFrames-frame)/30));
  const alpha=Math.min(inFade,outFade);
  return <AbsoluteFill style={{background:'#050A12',overflow:'hidden',opacity:alpha}}>
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 40% 35%,#17273D,#04070F 73%)'}}/>
    {/* Depth planes. Use alpha-matted originals for subject/foreground; 2D rig is explicit. */}
    {shot.layers.map(layer=>{
      const t=layerAt(layer.motion,frame,fps);
      const travelX=cam.x*layer.depth+t.x;
      const travelY=cam.y*layer.depth+t.y;
      const zoom=1+(cam.zoom-1)*layer.depth;
      const blur=focusBlur(layer.depth,plane);
      return <div key={layer.id} style={{position:'absolute',left:layer.rect.x,top:layer.rect.y,
        width:layer.rect.width,height:layer.rect.height,
        transformOrigin:(layer.pivot.x*100)+'% '+(layer.pivot.y*100)+'%',
        transform:`translate3d(${travelX.toFixed(3)}px,${travelY.toFixed(3)}px,0) rotate(${(cam.roll*layer.depth+t.rotation).toFixed(3)}deg) scale(${(zoom*t.scale).toFixed(5)})`,
        filter:`blur(${blur.toFixed(2)}px)`,opacity:layer.opacity*t.opacity,
        mixBlendMode:layer.blend,pointerEvents:'none'}}>
        {layer.rights.status==='cleared'
          ? <Img src={staticFile(layer.src)} style={{width:'100%',height:'100%',objectFit:'fill'}}/>
          : <div style={{width:'100%',height:'100%',background:'radial-gradient(ellipse at 50% 50%,'+accent+'2A,#0A1529A0 65%,transparent 85%)',border:'1px dashed '+accent+'52',borderRadius:42}}/>}
      </div>;
    })}
    {/* Continuous photographic light / graded vignette. Compositing, not fake volumetric scattering. */}
    <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at 52% 46%,transparent 33%,#000C 100%)'}}/>
    <div style={{position:'absolute',top:-330,bottom:-330,width:410,left:lightSweepX(globalFrame,fps),
      transform:'rotate(17deg)',background:'linear-gradient(90deg,transparent,'+accent+'17,transparent)',filter:'blur(60px)',pointerEvents:'none'}}/>
    {/* Essential text stays inside portrait safe-area; on-screen text is NOT a transcript. */}
    <div style={{position:'absolute',top:193,left:92,right:92,zIndex:10,
      opacity:clamp01(ease(frame/48)),textShadow:'0 4px 24px #000F'}}>
      <div style={{fontFamily:font,color:accent,letterSpacing:4,fontSize:23,fontWeight:800}}>{shot.label}</div>
      <div style={{fontFamily:font,fontWeight:900,color:'#F7FAFF',fontSize:91,lineHeight:1.04,
        letterSpacing:-2,whiteSpace:'pre-line',marginTop:44}}>{shot.headline}</div>
      <div style={{fontFamily:font,color:'#D4E2F1',fontSize:33,lineHeight:1.3,
        maxWidth:840,marginTop:40}}>{shot.description}</div>
    </div>
    <div style={{position:'absolute',bottom:278,left:92,right:92,zIndex:12,
      borderTop:'2px solid '+accent+'50',paddingTop:20,color:'#C4D5E5',fontFamily:font,fontSize:19,
      letterSpacing:2}}>{strict?'KAIRO KNOX / CINEMATIC FILM':'STORYBOARD PREVIEW · ASSETS NOT YET SUPPLIED'}</div>
  </AbsoluteFill>;
};

export const AssetDrivenFilm: React.FC<{film:AssetFilm; narrationFile?:string;strictAssets?:boolean}> =
({film,narrationFile='',strictAssets=false}) => {
  assertFilmShape(film);
  const {fps}=useVideoConfig();if(fps!==film.fps)throw new Error('FPS mismatch');
  let start=0;
  return <AbsoluteFill style={{background:'#050A11'}}>
    {film.shots.map(shot=>{
      const position=start;start+=shot.durationFrames-film.overlapFrames;
      return <Sequence key={shot.id} from={position} durationInFrames={shot.durationFrames} layout="none">
        <Scene shot={shot} offset={position} accent={film.accent} strict={strictAssets}/>
      </Sequence>;
    })}
    {narrationFile?<Audio src={staticFile(narrationFile)}/>:null}
  </AbsoluteFill>;
};
