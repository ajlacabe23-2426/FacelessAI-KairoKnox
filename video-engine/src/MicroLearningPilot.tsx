import React from 'react';
import {ProgressRail} from './ProgressRail';
import {useGsapTimeline} from '@remotion/gsap';
import {
  AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';

type PilotProps = {narrationFile?: string};
const background = 'radial-gradient(circle at 20% 16%, #16335d 0%, #080e22 38%, #050710 100%)';
const cyan = '#61e7ee';
const panel: React.CSSProperties = {
  border: '2px solid rgba(130,202,255,0.32)', borderRadius: 30,
  background: 'rgba(9,25,52,0.94)', boxShadow: '0 30px 85px rgba(0,0,0,0.35)',
};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Shell: React.FC<{eyebrow: string; children: React.ReactNode; caption: string}> =
  ({eyebrow, children, caption}) => (
    <AbsoluteFill style={{
      background, color: '#f3f9ff', fontFamily: 'Arial, sans-serif',
      padding: '192px 78px 230px', boxSizing: 'border-box',
    }}>
      <div style={{fontWeight: 800, letterSpacing: 6, fontSize: 25, color: cyan}}>{eyebrow}</div>
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
        {children}
      </div>
      <div style={{position:'absolute',left:78,bottom:103,color:'#94afcc',fontSize:23}}>
        KAIRO KNOX / ORIGINAL CODED VISUAL
      </div>
      <div style={{position:'absolute',right:78,top:77,color:'#8195b4',fontSize:20}}>
        ILLUSTRATIVE DEMO
      </div>
    </AbsoluteFill>
  );

const Hook: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline
      .from(selector('[data-hook-title]'), {y: 85, opacity: 0, duration: 0.85, ease: 'power3.out'})
      .from(selector('[data-hook-desc]'), {y: 38, opacity: 0, duration: 0.65, ease: 'power2.out'}, '-=0.25')
      .from(selector('[data-hook-line]'), {scaleX: 0, transformOrigin: 'left center', duration: 0.65, ease: 'power2.out'}, '<');
  });
  return (
    <Shell eyebrow="MICRO LEARNING  /  001" caption="An app asks. A server answers.">
      <div ref={scope}>
        <div data-hook-title style={{fontWeight:900,fontSize:113,letterSpacing:-4,lineHeight:1.03}}>
          HOW DOES AN APP<br/><span style={{color:cyan}}>GET DATA?</span>
        </div>
        <div data-hook-line style={{height:12,width:580,background:cyan,margin:'52px 0 48px',borderRadius:10}}/>
        <div data-hook-desc style={{fontSize:49,color:'#bdcee5',lineHeight:1.24}}>
          A 30-second visual guide to an API request.
        </div>
      </div>
    </Shell>
  );
};

const Request: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({fps,frame,config:{damping:200,stiffness:95}});
  const send = interpolate(frame % 160, [18, 108], [0, 1], clamp);
  return (
    <Shell eyebrow="STEP 1  /  REQUEST" caption="The app sends a request to a server.">
      <div style={{fontSize:75,fontWeight:900,marginBottom:64}}>THE APP <span style={{color:cyan}}>ASKS</span></div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{...panel,padding:35,width:320,transform:`translateY(${(1-enter)*70}px)`,opacity:enter}}>
          <div style={{fontSize:35,fontWeight:800,marginBottom:20}}>PHONE APP</div>
          <div style={{height:240,borderRadius:16,background:'#121d35',padding:24}}>
            <div style={{height:22,width:140,background:cyan,borderRadius:7,marginBottom:28}}/>
            <div style={{height:16,width:190,background:'#405e86',borderRadius:8,marginBottom:17}}/>
            <div style={{height:16,width:150,background:'#405e86',borderRadius:8}}/>
          </div>
        </div>
        <div style={{width:120,position:'relative'}}>
          <div style={{height:7,background:'#294665',width:'100%'}}/>
          <div style={{height:7,background:cyan,width:`${send*100}%`,position:'absolute',top:0,left:0}}/>
          <div style={{fontSize:24,textAlign:'center',marginTop:22,color:cyan,fontWeight:800}}>GET</div>
        </div>
        <div style={{...panel,padding:35,width:280,transform:`translateY(${(1-enter)*-70}px)`,opacity:enter}}>
          <div style={{fontSize:32,fontWeight:800}}>SERVER</div>
          <div style={{marginTop:34,display:'flex',flexDirection:'column',gap:24}}>
            {[0,1,2].map(n=><div key={n} style={{height:57,borderRadius:12,background:'#193456',border:'2px solid #345879',opacity:0.68+0.28*Math.sin(frame/15+n)}}/>)}
          </div>
        </div>
      </div>
      <div style={{fontSize:34,color:'#bdd1e5',marginTop:80}}>Example: request a list of articles.</div>
    </Shell>
  );
};

const Response: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [15, 65], [0, 1], clamp);
  const progress = interpolate(frame, [70, 140], [0, 1], clamp);
  return (
    <Shell eyebrow="STEP 2  /  RESPONSE" caption="The server returns structured information.">
      <div style={{fontSize:70,fontWeight:900,marginBottom:62}}>THE SERVER <span style={{color:cyan}}>REPLIES</span></div>
      <div style={{...panel,padding:55,transform:`translateY(${(1-reveal)*90}px)`,opacity:reveal}}>
        <div style={{fontSize:28,color:cyan,letterSpacing:3,fontWeight:900,marginBottom:24}}>RESPONSE 200 OK</div>
        <div style={{fontFamily:'monospace',fontSize:38,lineHeight:1.7,color:'#dbf1ff'}}>
          <div>{'{'}</div>
          <div style={{paddingLeft:36}}><span style={{color:'#91ddea'}}>"articles"</span>: [</div>
          <div style={{paddingLeft:73}}>{'{'} <span style={{color:'#91ddea'}}>"title"</span>: <span style={{color:'#afffd2'}}>"New story"</span> {'}'}</div>
          <div style={{paddingLeft:36}}>]</div>
          <div>{'}'}</div>
        </div>
      </div>
      <div style={{marginTop:70,height:12,background:'#203b59',borderRadius:10}}>
        <div style={{height:'100%',width:`${progress*100}%`,background:cyan,borderRadius:10}}/>
      </div>
      <div style={{marginTop:24,fontSize:31,color:'#bdcee5'}}>That response is then used by the app.</div>
    </Shell>
  );
};

const Takeaway: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cards = ['REQUEST', 'RESPONSE', 'SCREEN'];
  return (
    <Shell eyebrow="SAVE THIS  /  THE BIG IDEA" caption="Request → response → screen.">
      <div style={{fontSize:78,fontWeight:900,marginBottom:60}}>THE LOOP <span style={{color:cyan}}>EXPLAINED</span></div>
      {cards.map((name,index)=>{
        const progress = spring({fps,frame:frame-index*18,config:{damping:180,stiffness:100}});
        return <div key={name} style={{
          ...panel, marginBottom:24,padding:'38px 44px',fontWeight:900,fontSize:55,
          transform:`translateX(${(1-progress)*115}px)`,opacity:progress,
          color:index===2?'#afffd2':'#f3f9ff'
        }}><span style={{color:cyan,marginRight:30}}>{index+1}.</span>{name}</div>;
      })}
      <div style={{fontSize:37,lineHeight:1.3,marginTop:48,color:'#c6d5e9'}}>
        An API is a way for software to exchange requests and responses.
      </div>
    </Shell>
  );
};

export const MicroLearningPilot: React.FC<PilotProps> = ({narrationFile}) => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={150}><Hook/></Sequence>
    <Sequence from={150} durationInFrames={285}><Request/></Sequence>
    <Sequence from={435} durationInFrames={255}><Response/></Sequence>
    <Sequence from={690} durationInFrames={210}><Takeaway/></Sequence>
    {narrationFile ? <Audio src={staticFile(narrationFile)}/> : null}
    <ProgressRail accent={cyan}/>
  </AbsoluteFill>
);
