import React from 'react';
import {useGsapTimeline} from '@remotion/gsap';
import {
  AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

type Props = {narrationFile?: string};
const accent = '#e6a9ff';
const aqua = '#78f1ea';
const bg = 'radial-gradient(ellipse at 80% 14%, #3a184b 0%, #100d27 47%, #070815 100%)';
const clamp = {extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const fade = (frame:number,start:number,end:number) => interpolate(frame,[start,end],[0,1],clamp);
const card: React.CSSProperties={border:'2px solid rgba(225,177,252,0.36)',borderRadius:34,background:'rgba(27,18,52,0.94)',boxShadow:'0 25px 80px #0007'};

const Scene: React.FC<{tag:string;subtitle:string;children:React.ReactNode}> = ({tag,subtitle,children}) => (
  <AbsoluteFill style={{background:bg,color:'#fcfaff',fontFamily:'Arial, sans-serif',padding:'172px 78px 180px',boxSizing:'border-box'}}>
    <div style={{position:'absolute',top:72,left:78,right:78,fontSize:24,fontWeight:900,letterSpacing:5,color:accent}}>
      SIGNAL CUTS <span style={{float:'right',color:'#aeb5d8'}}>KAIRO KNOX</span>
    </div>
    <div style={{fontSize:27,letterSpacing:3,fontWeight:800,color:aqua,marginBottom:50}}>{tag}</div>
    <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>{children}</div>
    <div style={{position:'absolute',left:78,right:78,bottom:167,background:'rgba(13,10,33,0.96)',borderRadius:23,padding:'25px 30px',textAlign:'center',fontSize:39,lineHeight:1.2,fontWeight:800}}>
      {subtitle}
    </div>
    <div style={{position:'absolute',bottom:89,left:78,fontSize:21,color:'#9b9ab6'}}>
      ORIGINAL ILLUSTRATION · RECOMMENDERS VARY BY PLATFORM
    </div>
  </AbsoluteFill>
);

const Intro: React.FC = () => {
 const scope=useGsapTimeline<HTMLDivElement>(({timeline,selector})=>{
   timeline.from(selector('[data-headline]'),{y:130,opacity:0,duration:0.75,ease:'power3.out'})
     .from(selector('[data-emphasis]'),{scale:0.8,opacity:0,duration:0.75,ease:'back.out(1.4)'},'-=0.2')
     .from(selector('[data-bottom]'),{y:80,opacity:0,duration:0.5},'-=0.2');
 });
 return <Scene tag="THE ALGORITHM / YOUR ATTENTION" subtitle="Every interaction can become a signal.">
   <div ref={scope}>
     <div data-headline style={{fontSize:102,fontWeight:900,lineHeight:1.05,letterSpacing:-4}}>
       YOU STOP.<br/>YOU WATCH.
     </div>
     <div data-emphasis style={{fontSize:104,fontWeight:900,color:accent,lineHeight:1.07,marginTop:20}}>IT LEARNS?</div>
     <div data-bottom style={{width:740,height:12,borderRadius:10,background:aqua,marginTop:54}}/>
     <div style={{fontSize:37,color:'#ddd3ee',marginTop:42}}>How a recommendation loop can work.</div>
   </div>
 </Scene>;
};

const Signals:React.FC=()=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const chips=[['WATCH TIME','07.2 s'],['TAP','LIKE'],['SHARE','↗']];
 return <Scene tag="STEP 1 / ACTIVITY" subtitle="Views, likes and shares may influence ranking.">
   <div style={{fontSize:78,fontWeight:900,marginBottom:55,lineHeight:1.05}}>A FEED SEES<br/><span style={{color:accent}}>SIGNALS.</span></div>
   <div style={{display:'flex',alignItems:'center',gap:38}}>
     <div style={{...card,width:418,height:630,padding:28,boxSizing:'border-box',transform:'rotate(-3deg)'}}>
       <div style={{height:450,borderRadius:20,background:'linear-gradient(165deg,#482e6b,#181635)',position:'relative',overflow:'hidden'}}>
         <div style={{position:'absolute',top:80,left:42,right:42,height:300,borderRadius:250,border:'18px solid #be92e0',opacity:.58,transform:`rotate(${frame*0.14}deg)`}}/>
         <div style={{position:'absolute',top:166,left:138,width:95,height:95,borderRadius:'50%',background:aqua,opacity:.78}}/>
         <div style={{position:'absolute',bottom:18,left:20,fontSize:29,fontWeight:900}}>SAMPLE VIDEO</div>
       </div>
       <div style={{fontSize:28,fontWeight:800,marginTop:32}}>A content card</div>
       <div style={{height:12,width:160,background:'#8b729c',borderRadius:10,marginTop:18}}/>
     </div>
     <div style={{width:425,display:'flex',flexDirection:'column',gap:26}}>
       {chips.map(([label,value],i)=>{
         const p=spring({fps,frame:frame-i*25,config:{damping:170,stiffness:90}});
         return <div key={label} style={{...card,padding:'32px 30px',transform:`translateX(${(1-p)*100}px)`,opacity:p}}>
           <div style={{fontSize:21,color:'#d3b8e8',letterSpacing:2,fontWeight:900}}>{label}</div>
           <div style={{fontSize:51,color:i===0?aqua:'#fff',fontWeight:900,marginTop:9}}>{value}</div>
         </div>;
       })}
     </div>
   </div>
 </Scene>;
};

const Loop:React.FC=()=>{
 const frame=useCurrentFrame();const flow=fade(frame,25,130);
 const x=340+420*flow;
 return <Scene tag="STEP 2 / RANKING" subtitle="A model can use signals to choose what appears next.">
   <div style={{fontSize:78,fontWeight:900,marginBottom:80}}>THE <span style={{color:accent}}>FEEDBACK</span><br/>LOOP</div>
   <svg width="930" height="530" viewBox="0 0 930 530" style={{overflow:'visible'}}>
     <defs>
       <linearGradient id="pulse" x1="0" x2="1"><stop offset="0%" stopColor="#b17ee8"/><stop offset="100%" stopColor="#7df7e8"/></linearGradient>
     </defs>
     <path d="M180 170 L750 170 Q823 170 823 245 L823 345 Q823 410 742 410 L180 410 Q113 410 113 345 L113 265"
       fill="none" stroke="#644f88" strokeWidth="14" strokeLinecap="round"/>
     <path d="M180 170 L750 170" stroke="url(#pulse)" strokeWidth="14" strokeLinecap="round"
       strokeDasharray="570" strokeDashoffset={570*(1-flow)}/>
     <circle cx={Math.min(x,745)} cy="170" r="25" fill={aqua} style={{filter:'drop-shadow(0 0 18px #7df7e8)'}}/>
     <rect x="32" y="102" width="275" height="145" rx="24" fill="#25193f" stroke="#c99cf0" strokeWidth="3"/>
     <text x="169" y="165" fontSize="32" fontWeight="900" fill="#fff" textAnchor="middle">YOUR</text>
     <text x="169" y="206" fontSize="32" fontWeight="900" fill={aqua} textAnchor="middle">ACTIONS</text>
     <rect x="628" y="102" width="280" height="145" rx="24" fill="#25193f" stroke="#c99cf0" strokeWidth="3"/>
     <text x="766" y="163" fontSize="29" fontWeight="900" fill="#fff" textAnchor="middle">RANKING</text>
     <text x="766" y="208" fontSize="27" fontWeight="900" fill={aqua} textAnchor="middle">MODEL</text>
     <rect x="343" y="332" width="242" height="141" rx="24" fill="#25193f" stroke="#c99cf0" strokeWidth="3"/>
     <text x="464" y="385" fontSize="30" fontWeight="900" fill="#fff" textAnchor="middle">NEXT</text>
     <text x="464" y="431" fontSize="28" fontWeight="900" fill={aqua} textAnchor="middle">POST</text>
   </svg>
   <div style={{fontSize:33,color:'#d6c6e1',marginTop:18}}>Illustrative system — not any platform's real algorithm.</div>
 </Scene>;
};

const Close: React.FC=()=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 return <Scene tag="THE POINT / THINK CRITICALLY" subtitle="Your feed predicts attention — not what is true.">
   <div style={{fontSize:97,fontWeight:900,lineHeight:1.06}}>A FEED IS<br/>A <span style={{color:accent}}>PREDICTION.</span></div>
   <div style={{fontSize:60,fontWeight:900,marginTop:55,color:aqua}}>NOT A VERDICT.</div>
   {['PICK YOUR SOURCES','QUESTION YOUR FEED'].map((text,i)=>{
     const p=spring({fps,frame:frame-20-i*25,config:{damping:170}});
     return <div key={text} style={{
       ...card,padding:'37px 38px',fontSize:41,fontWeight:900,marginTop:i===0?85:22,
       transform:`translateY(${(1-p)*95}px)`,opacity:p
     }}>{text}</div>;
   })}
 </Scene>;
};

export const SignalCutPilot:React.FC<Props>=({narrationFile})=>(
 <AbsoluteFill>
  <Sequence from={0} durationInFrames={150}><Intro/></Sequence>
  <Sequence from={150} durationInFrames={255}><Signals/></Sequence>
  <Sequence from={405} durationInFrames={255}><Loop/></Sequence>
  <Sequence from={660} durationInFrames={240}><Close/></Sequence>
  {narrationFile?<Audio src={staticFile(narrationFile)}/>:null}
 </AbsoluteFill>
);
