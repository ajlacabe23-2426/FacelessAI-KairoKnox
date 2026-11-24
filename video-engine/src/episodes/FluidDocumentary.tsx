import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {FluidBeat, FluidEpisode, VisualMode} from './episodePlans';
import {fluidEpisodes, getDuration, validateFluid} from './episodePlans';
import {CinematicCamera} from '../cinema/components/CinematicCamera';
import {FilmGrainOverlay} from '../cinema/components/FilmGrainOverlay';
import {FluidTransition} from '../cinema/components/FluidTransition';
import {cubicBezier, springEnter, seededUnit, clamp01} from '../cinema/motion';

type FilmProps = {episode: FluidEpisode; narrationFile?: string};
const sans = 'Arial, Helvetica, sans-serif';
const mono = 'Consolas, Menlo, Monaco, monospace';
const delay = (local: number, start: number, width = 48) =>
  cubicBezier(clamp01((local-start)/width),0.24,0.82,0.34,1);
const pct = (v:number) => String(Math.round(v*100))+'%';

const HaloBackground: React.FC<{frame:number;fps:number;episode:FluidEpisode}> = ({frame,fps,episode}) => {
  const t=frame/fps;
  return (
    <AbsoluteFill style={{overflow:'hidden',background:'radial-gradient(ellipse at 34% 21%,#10273C 0%,#070E20 44%,#02050B 100%)'}}>
      <CinematicCamera globalFrame={frame} fps={fps} depth={0.24}>
        <AbsoluteFill style={{
          backgroundImage:'linear-gradient(#9AC7EC13 1px,transparent 1px),linear-gradient(90deg,#9AC7EC13 1px,transparent 1px)',
          backgroundSize:'75px 75px',transform:'perspective(1200px) rotateX(12deg) scale(1.2)',
          maskImage:'radial-gradient(ellipse at 50% 48%,black 12%,transparent 80%)',
        }}/>
        {[0,1,2,3].map(i=><div key={i} style={{
          position:'absolute',width:980+i*180,height:980+i*180,
          border:'2px solid '+episode.accent+'26',borderRadius:'50%',
          left:-410-i*120+Math.sin(t*.4+i)*38,top:140+i*135,
          boxShadow:'0 0 110px '+episode.accent+'12',
          transform:'rotateX(53deg) rotateZ('+(t*3.5+i*31)+'deg)',filter:'blur(2px)'
        }}/>)}
      </CinematicCamera>
      <CinematicCamera globalFrame={frame} fps={fps} depth={0.74}>
        <div style={{position:'absolute',left:430,top:230,width:850,height:920,
          borderRadius:'50%',background:'radial-gradient(circle,'+episode.accent+'2B,transparent 66%)',
          transform:'translate3d('+(45*Math.sin(t*.45))+'px,'+(25*Math.cos(t*.33))+'px,0)',
          filter:'blur(72px)'}}/>
        <div style={{position:'absolute',left:-300,bottom:30,width:880,height:660,
          borderRadius:'50%',background:'radial-gradient(circle,'+episode.secondaryAccent+'18,transparent 68%)',
          filter:'blur(74px)'}}/>
      </CinematicCamera>
      <CinematicCamera globalFrame={frame} fps={fps} depth={1.48}>
        {Array.from({length:66},(_,i)=>{
          const x=seededUnit(i*31+93)*1140-40;
          const y=seededUnit(i*29+70)*2040-60;
          const p=seededUnit(i*13+12)*Math.PI*2;
          return <div key={i} style={{position:'absolute',left:x+21*Math.sin(t*(.11+(i%4)*.06)+p),
            top:y-15*Math.cos(t*(.21+(i%5)*.035)+p),width:i%6===0?5:2.4,height:i%6===0?5:2.4,
            borderRadius:'50%',background:i%3===0?episode.accent:'#B3C7DE',
            opacity:.18+.28*seededUnit(220+i),filter:i%4===0?'blur(1.5px)':'blur(.5px)',
            boxShadow:'0 0 11px '+episode.accent+'44'}}/>;
        })}
      </CinematicCamera>
    </AbsoluteFill>
  );
};

const VectorWorld: React.FC<{
  beat:FluidBeat; frame:number; fps:number; accent:string; secondary:string;
}> = ({beat,frame,fps,accent,secondary}) => {
  const t=frame/fps;
  const items=beat.rows;
  const progress=delay(frame,18,55);
  const w=850,h=490;
  const cy=237;
  const xPositions=items.map((_,i)=>120+(i/(Math.max(1,items.length-1)))*610);
  const mode:VisualMode=beat.mode;
  const isCode=mode==='code'||mode==='prompt';
  const isMarket=mode==='market';
  const isComparative=mode==='compare'||mode==='audit'||mode==='policy';
  if(isCode){
    return <div style={{height:h,width:w,position:'relative',borderRadius:29,
      border:'1px solid '+accent+'60',boxShadow:'0 28px 95px #000D, inset 0 1px 0 #FFFFFF15',
      background:'linear-gradient(140deg,#10223BF8,#05111CF7)',overflow:'hidden'}}>
      <div style={{height:73,display:'flex',alignItems:'center',gap:14,paddingLeft:30,
        borderBottom:'1px solid #92B9D333',background:'#081A2B90'}}>
        {[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:'50%',
          background:[secondary,accent,'#92B4CF'][i],opacity:.76}}/>)}
        <div style={{fontSize:18,letterSpacing:2,fontFamily:mono,color:'#A8C3D6',marginLeft:19}}>
          {mode==='code'?'AGENT EXECUTION / EXCERPT':'PROMPT LAB / INPUT CONTRACT'}
        </div>
      </div>
      <div style={{padding:'42px 34px'}}>
        {items.map((item,i)=>{
          const enter=springEnter(frame,fps,i*13+8);
          const reveal=delay(frame,24+i*22,35);
          return <div key={item.label} style={{display:'flex',gap:22,marginBottom:31,
            opacity:clamp01(enter),transform:'translate3d('+((1-enter)*75)+'px,0,0)',
            fontFamily:mono,fontSize:Math.min(32,Math.max(25,690/(item.value.length+3))),
            whiteSpace:'pre',color:i===0?accent:'#D8F0F9'}}>
            <span style={{color:'#6793AE',fontSize:20,marginTop:5,width:38}}>{item.label}</span>
            <span style={{position:'relative',overflow:'hidden',maxWidth:715}}>
              <span style={{opacity:.22}}>{item.value}</span>
              <span style={{position:'absolute',left:0,top:0,right:0,
                color:i%2===0?accent:'#E8F7FF',width:pct(reveal),overflow:'hidden',whiteSpace:'nowrap'}}>{item.value}</span>
            </span>
          </div>;
        })}
      </div>
      <div style={{position:'absolute',right:25,bottom:23,fontSize:19,color:accent,
        fontFamily:mono,opacity:.6+.25*Math.sin(t*2.2)}}>● TRACE READY</div>
    </div>;
  }
  return <svg width={w} height={h} viewBox={'0 0 '+w+' '+h} role="img"
    aria-label={'Animated '+mode+' illustration using '+items.map(x=>x.label+': '+x.value).join(', ')}>
    <defs>
      <linearGradient id={'track-'+beat.id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".06"/>
        <stop offset="50%" stopColor={accent} stopOpacity=".95"/>
        <stop offset="100%" stopColor={secondary} stopOpacity=".25"/>
      </linearGradient>
      <filter id={'bloom-'+beat.id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
    </defs>
    {Array.from({length:9},(_,i)=>
      <line key={'grid'+i} x1="0" x2={w} y1={45+i*51} y2={45+i*51}
        stroke="#8ECAED" opacity=".08" strokeWidth="1"/>)}
    {isMarket
      ? items.map((item,i)=>{
          const barHeight=(0.48+i*0.20)*(240+30*Math.sin(t*.45+i));
          const x=58+i*270;
          const enter=delay(frame,14+i*12,75);
          return <g key={i}>
            <rect x={x} y={390-barHeight*enter} rx="22" width="190" height={barHeight*enter}
              fill={i===0?accent:secondary} fillOpacity=".13" stroke={i===0?accent:secondary} strokeOpacity=".65"/>
            <rect x={x+17} y={390-barHeight*enter+18} rx="14" width="156" height="8"
              fill={i===0?accent:secondary} opacity={.55+Math.sin(t*.6+i)*.25}/>
            <text x={x+95} y={400-barHeight*enter+barHeight*enter*.62}
              textAnchor="middle" fill="#F3FAFF" fontWeight="800" fontSize={i===0?'45':'38'}>{item.value}</text>
            <text x={x+95} y="438" fill="#ABC0D7" textAnchor="middle" fontSize="20" letterSpacing="1.4">{item.label}</text>
          </g>;
        })
      : <>
          <path d={'M'+xPositions[0]+','+cy+' C'+(w*.37)+','+(cy-125+Math.sin(t*.7)*15)+
            ' '+(w*.64)+','+(cy+140+Math.cos(t*.6)*13)+' '+xPositions[xPositions.length-1]+','+cy}
            fill="none" stroke={accent} strokeWidth="19" strokeOpacity=".10"
            filter={'url(#bloom-'+beat.id+')'}/>
          <path d={'M'+xPositions[0]+','+cy+' C'+(w*.37)+','+(cy-125+Math.sin(t*.7)*15)+
            ' '+(w*.64)+','+(cy+140+Math.cos(t*.6)*13)+' '+xPositions[xPositions.length-1]+','+cy}
            fill="none" stroke={'url(#track-'+beat.id+')'} strokeWidth="5.5"
            strokeDasharray="1150" strokeDashoffset={1150*(1-progress)}/>
          {Array.from({length:3},(_,i)=>{
            const phase=(t*.23+i/3)%1;
            const x=120+phase*610;
            const y=cy+Math.sin(phase*Math.PI*2)*51+Math.sin(t*.7)*11;
            return <g key={'signal'+i} opacity={progress}>
              <circle cx={x} cy={y} r={8+i*3} fill={accent} opacity=".2" filter={'url(#bloom-'+beat.id+')'}/>
              <circle cx={x} cy={y} r="5.2" fill={accent}/>
            </g>;
          })}
          {items.map((item,i)=>{
            const x=xPositions[i];
            const y=cy+(i%2?38:-34);
            const ent=springEnter(frame,fps,8+i*15);
            const r=(isComparative?81:69)+4*Math.sin(t*.9+i);
            return <g key={i} opacity={clamp01(ent)}
              transform={'translate(0 '+((1-ent)*56)+')'}>
              <circle cx={x} cy={y} r={r+19} fill={accent} fillOpacity=".05"
                stroke={accent} strokeWidth="1.4" strokeOpacity=".13"/>
              <circle cx={x} cy={y} r={r} fill="#0C2334" stroke={i===1?secondary:accent} strokeOpacity=".85" strokeWidth="3"/>
              <circle cx={x} cy={y} r={r-15} fill="#112337" fillOpacity=".84" stroke="#B3D9F9" strokeOpacity=".1"/>
              <text x={x} y={y-7} textAnchor="middle" fill="#A5BDCE" fontWeight="800"
                fontSize={Math.max(15,Math.min(21,190/(item.label.length*.7)))}>{item.label}</text>
              <text x={x} y={y+23} textAnchor="middle" fill={i===1?secondary:accent} fontWeight="800"
                fontSize={Math.max(14,Math.min(23,240/(item.value.length*.69)))}>{item.value}</text>
              <circle cx={x} cy={y} r={r+30} fill="none" stroke={accent} strokeDasharray="8 24"
                strokeWidth="1.3" strokeOpacity=".22"
                transform={'rotate('+(t*(i%2?13:-10))+' '+x+' '+y+')'}/>
            </g>;
          })}
        </>}
    {mode==='timeline'&&<path d={'M92 440 H758'} stroke={accent} strokeWidth="4"
      strokeDasharray="18 10" strokeDashoffset={-(frame*.65)} opacity=".56"/>}
  </svg>;
};

const FluidScene: React.FC<{beat:FluidBeat;episode:FluidEpisode;localFrame:number;globalFrame:number;fps:number}> =
({beat,episode,localFrame,globalFrame,fps}) => {
  const enter=springEnter(localFrame,fps,0);
  const descEnter=springEnter(localFrame,fps,26);
  const titleParts=Array.from(beat.headline);
  const t=globalFrame/fps;
  return <AbsoluteFill>
    <CinematicCamera globalFrame={globalFrame} fps={fps} depth={.22}>
      <div style={{position:'absolute',left:86,right:86,top:176,
        fontFamily:mono,fontSize:22,letterSpacing:2.6,fontWeight:800,
        color:episode.accent,opacity:.7+.2*Math.sin(t*.75)}}>{beat.eyebrow}</div>
      <div style={{position:'absolute',left:82,right:66,top:287,display:'flex',flexWrap:'wrap',
        alignItems:'baseline',alignContent:'flex-start',gap:0}}>
        {titleParts.map((ch,i)=>{
          const p=springEnter(localFrame,fps,i*2.1);
          return <span key={i} style={{display:ch==='\n'?'block':'inline-block',
            width:ch==='\n'?'100%':undefined,height:ch==='\n'?0:undefined,
            fontSize:96,fontFamily:sans,fontWeight:900,lineHeight:1.03,letterSpacing:-4,
            whiteSpace:'pre',color:i>titleParts.length*.66?episode.accent:'#F3FAFF',
            transform:'translate3d(0,'+((1-p)*74)+'px,0) rotate('+((1-p)*-6)+'deg)',
            opacity:clamp01(p),textShadow:'0 8px 30px #0007'}}>
            {ch==='\n'?'':ch}
          </span>;
        })}
      </div>
      <div style={{position:'absolute',top:560,left:86,right:86,
        fontFamily:sans,fontSize:29.5,lineHeight:1.4,color:'#C0D2E7',
        opacity:clamp01(descEnter),
        transform:'translate3d(0,'+((1-descEnter)*32)+'px,0)'}}>
        {beat.caption}
      </div>
    </CinematicCamera>
    <CinematicCamera globalFrame={globalFrame} fps={fps} depth={.83}>
      <div style={{position:'absolute',left:114,right:112,top:830,
        transform:'translate3d('+(Math.sin(t*.51)*9)+'px,'+(Math.cos(t*.63)*6)+'px,0)'}}>
        <VectorWorld beat={beat} frame={localFrame} fps={fps} accent={episode.accent} secondary={episode.secondary}/>
      </div>
    </CinematicCamera>
    <div style={{position:'absolute',left:84,right:84,top:1507,height:170,
      display:'flex',alignItems:'center',borderLeft:'3px solid '+episode.accent,
      background:'linear-gradient(90deg,'+episode.accent+'19,transparent)',padding:'25px 30px',boxSizing:'border-box',
      opacity:clamp01(springEnter(localFrame,fps,52))}}>
      <div style={{fontFamily:mono,fontSize:21,color:'#CEE0EF',lineHeight:1.48,letterSpacing:.25}}>
        {beat.footnote ?? 'KAIRO KNOX / ORIGINAL ILLUSTRATIVE ANIMATION'}
      </div>
    </div>
    <div style={{position:'absolute',bottom:180,left:86,right:86,display:'flex',justifyContent:'space-between',
      fontFamily:mono,letterSpacing:1.4,fontSize:18,color:'#A1B5C9'}}>
      <span>{episode.series}</span><span>SCENE {episode.scenes.indexOf(beat)+1}/{episode.scenes.length}</span>
    </div>
  </AbsoluteFill>;
};

export const FluidDocumentary: React.FC<FilmProps> = ({episode,narrationFile=''}) => {
  validateFluid(episode);
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  if(fps!==episode.fps) throw new Error('Composition frame rate must match episode frame rate.');
  let start=0;
  return <AbsoluteFill style={{background:'#02050A'}}>
    <HaloBackground frame={frame} fps={fps} episode={episode}/>
    {episode.scenes.map(beat=>{
      const initial=start;
      start+=beat.duration-episode.overlap;
      return <Sequence key={beat.id} from={initial} durationInFrames={beat.duration} layout="none">
        <FluidTransition localFrame={useLocalFrameSafe(frame,initial)} durationInFrames={beat.duration}
          overlapFrames={episode.overlap}>
          <FluidScene beat={beat} episode={episode} localFrame={Math.max(0,frame-initial)}
            globalFrame={frame} fps={fps}/>
        </FluidTransition>
      </Sequence>;
    })}
    <FilmGrainOverlay globalFrame={frame} fps={fps} accent={episode.accent} durationInFrames={getDuration(episode)}/>
    {narrationFile?<Audio src={staticFile(narrationFile)}/>:null}
    <div style={{position:'absolute',top:75,left:84,right:84,height:5,background:'#91AACA28',
      borderRadius:3,overflow:'hidden'}}>
      <div style={{height:'100%',width:pct(delay(frame,0,getDuration(episode))),
        background:episode.accent,boxShadow:'0 0 15px '+episode.accent}}/>
    </div>
    {!narrationFile&&<div style={{position:'absolute',top:112,left:84,fontFamily:mono,
      fontSize:16,color:'#8CA5B9',letterSpacing:1.3}}>VISUAL DIRECTOR CUT / NO NARRATION</div>}
  </AbsoluteFill>;
};
const useLocalFrameSafe = (frame:number,start:number): number => Math.max(0,frame-start);
export const NVIDIA_FILM=fluidEpisodes[0];
export const AGENT_FILM=fluidEpisodes[1];
export const PROMPT_FILM=fluidEpisodes[2];
