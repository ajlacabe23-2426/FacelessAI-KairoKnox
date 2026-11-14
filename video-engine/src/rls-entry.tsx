import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, registerRoot, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ProgressRail} from './ProgressRail';
type Props={narrationFile?:string};
const fps=30,D=54;
const c={bg:'#071321',panel:'#10253a',ink:'#edf7ff',muted:'#a8bed1',cyan:'#62e7ee',green:'#79e9af',red:'#ff8b98',border:'#294b65'};
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const records=[{id:'101',owner:'A',label:'Invoice 101'},{id:'202',owner:'B',label:'Invoice 202'}];
function readRows(user:string, enabled:boolean){return records.filter(r=>!enabled||r.owner===user)}
const panel:React.CSSProperties={background:c.panel,border:'2px solid '+c.border,borderRadius:25,padding:28};
const beats=[
[0,7,'01 / THE SECURITY GAP','LOGGED IN.','STILL AT RISK?'],
[7,15,'02 / POLICY OFF','TWO ACCOUNTS.','ONE DATABASE.'],
[15,22,'03 / LEAK SIMULATION','AUTHENTICATED','≠ AUTHORIZED'],
[22,32,'04 / DATABASE POLICY','ENFORCE','OWNERSHIP.'],
[32,43,'05 / POLICY ON','SAME QUERY.','DIFFERENT RESULT.'],
[43,54,'06 / VERIFY ISOLATION','TEST BOTH','IDENTITIES.'],
] as const;
const Row:React.FC<{r:typeof records[number];allowed:boolean;delay?:number;local:number;show?:boolean}>=({r,allowed,delay=0,local,show=true})=>{
 const p=interpolate(local,[delay,delay+16],[0,1],clamp);
 return <div style={{...panel,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,opacity:p,transform:`translateX(${(1-p)*45}px)`,borderColor:allowed?c.green:c.red}}>
 <div><div style={{fontSize:36,fontWeight:800}}>{r.label}</div><div style={{color:c.muted,fontSize:26,marginTop:9}}>Owner: User {r.owner}</div></div>
 <div style={{fontWeight:900,fontSize:26,color:allowed?c.green:c.red}}>{show?(allowed?'VISIBLE':'FILTERED'):'—'}</div></div>;
};
function Label({children,color=c.cyan}:{children:React.ReactNode;color?:string}){return <div style={{fontSize:27,fontWeight:900,letterSpacing:2,color,marginBottom:21}}>{children}</div>}
function Tag({children,color=c.cyan}:{children:React.ReactNode;color?:string}){return <span style={{padding:'10px 18px',border:'2px solid '+color,borderRadius:16,color,fontSize:25,fontWeight:800}}>{children}</span>}
const Rls:React.FC<Props>=({narrationFile})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),sec=f/fps;
 const beat=beats.find(b=>sec>=b[0]&&sec<b[1])??beats[5];
 const idx=beats.indexOf(beat),local=f-beat[0]*fps;
 const enter=spring({fps,frame:local,config:{damping:180,stiffness:95}});
 const pulse=interpolate(local,[0,(beat[1]-beat[0])*fps],[0,1],clamp);
 const user='A';
 const visible=readRows(user,idx>=4);
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 20% 10%,#173b5b 0%,#0a1b2d 38%,#06101c 77%)',color:c.ink,fontFamily:'Arial, sans-serif',padding:'165px 76px 240px',boxSizing:'border-box'}}>
 <div style={{position:'absolute',top:75,left:76,color:c.cyan,fontWeight:900,letterSpacing:4,fontSize:26}}>KAIRO KNOX / MICRO LEARNING</div>
 <div style={{position:'absolute',top:117,left:76,color:c.muted,fontSize:22}}>INTERMEDIATE • OFFLINE SIMULATION</div>
 <div style={{marginTop:35,color:c.muted,fontSize:27,fontWeight:800,letterSpacing:3}}>{beat[2]}</div>
 <div style={{fontSize:82,lineHeight:1.02,fontWeight:900,letterSpacing:-3,marginTop:26,transform:`translateY(${(1-enter)*35}px)`,opacity:enter}}>{beat[3]}<br/><span style={{color:c.cyan}}>{beat[4]}</span></div>
 <div style={{height:7,width:900,background:c.border,margin:'38px 0 46px',borderRadius:10}}><div style={{width:`${pulse*100}%`,height:'100%',background:c.cyan,borderRadius:10}}/></div>
 <div style={{opacity:enter,transform:`translateY(${(1-enter)*24}px)`}}>
 {idx===0&&<><div style={{...panel,padding:40}}><Label color={c.green}>SESSION VERIFIED</Label><div style={{fontSize:44,fontWeight:900}}>User A signed in</div><div style={{marginTop:25,fontSize:31,color:c.muted}}>Identity confirmed.</div></div><div style={{...panel,marginTop:24,borderColor:c.red}}><Label color={c.red}>AUTHORIZATION?</Label><div style={{fontSize:39,fontWeight:800}}>Which records can A read?</div></div></>}
 {idx===1&&<><div style={{display:'flex',justifyContent:'space-between',marginBottom:27}}><Tag>User A • signed in</Tag><Tag>User B • signed in</Tag></div><Label>INVOICES TABLE / RLS OFF</Label>{records.map((r,i)=><Row key={r.id} r={r} show={false} allowed={true} delay={i*12} local={local}/>)}</>}
 {idx===2&&<><Label color={c.red}>POLICY OFF • USER A READ</Label><div style={{...panel,fontFamily:'monospace',fontSize:35,marginBottom:22}}>SELECT * FROM invoices;</div>{visible.map((r,i)=><Row key={r.id} r={r} allowed={true} local={local} delay={i*17}/>)}<div style={{...panel,borderColor:c.red,color:c.red,fontSize:34,fontWeight:900}}>2 records / isolation fails</div></>}
 {idx===3&&<><Label>POSTGRESQL / SUPABASE READ POLICY</Label><div style={{...panel,fontFamily:'monospace',fontSize:31,lineHeight:1.55,color:'#d3f2ff',whiteSpace:'pre-wrap',overflowWrap:'break-word'}}>
 {'ALTER TABLE invoices\n  ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY own_read\nON invoices FOR SELECT\nTO authenticated\nUSING (owner_id = auth.uid());'}</div><div style={{fontSize:31,color:c.muted,marginTop:25}}>Evaluate ownership per row.</div></>}
 {idx===4&&<><Label color={c.green}>POLICY ON • USER A READ</Label><div style={{...panel,fontFamily:'monospace',fontSize:35,marginBottom:22}}>SELECT * FROM invoices;</div>{records.map((r,i)=><Row key={r.id} r={r} allowed={visible.includes(r)} local={local} delay={i*16}/>)}<div style={{...panel,borderColor:c.green,color:c.green,fontSize:32,fontWeight:900}}>1 returned row • 1 filtered</div></>}
 {idx===5&&<><Label>SIMULATED READ TEST / BOTH USERS</Label>{['A','B'].map((identity,i)=>{const result=readRows(identity,true);const pass=result.length===1&&result.every(r=>r.owner===identity);const p=interpolate(local,[i*12,i*12+16],[0,1],clamp);return <div key={identity} style={{...panel,marginBottom:18,opacity:p,transform:`translateX(${(1-p)*45}px)`,borderColor:pass?c.green:c.red}}><div style={{fontSize:30,fontWeight:800}}>User {identity} • signed in</div><div style={{fontSize:35,marginTop:10,color:c.ink,fontWeight:800}}>{result.map(r=>r.label).join(', ')||'No rows'}</div><div style={{fontSize:24,marginTop:9,color:pass?c.green:c.red}}>{pass?'PASS • own row only':'FAIL • unexpected rows'}</div></div>})}<div style={{...panel,marginTop:10,fontSize:30,lineHeight:1.3}}>Test writes separately as ordinary users. Define explicit write policies.</div><div style={{fontSize:26,color:c.muted,marginTop:24}}>Privileged roles can bypass RLS.</div></>}
 </div>
 <div style={{position:'absolute',bottom:100,left:76,color:c.muted,fontWeight:700,fontSize:24}}>AUTHENTICATION ≠ AUTHORIZATION</div>
 {narrationFile?<Audio src={staticFile(narrationFile)}/>:null}<ProgressRail accent={c.cyan}/></AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="RlsIsolation" component={Rls} width={1080} height={1920} fps={fps} durationInFrames={D*fps} defaultProps={{narrationFile:''}}/>;
registerRoot(Root);
