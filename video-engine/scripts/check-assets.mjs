#!/usr/bin/env node
/** Offline, dependency-free manifest/rights preflight. No credits and no network. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export const defaultManifest=path.resolve(here,'../asset-cinema/shot-plans.json');
export const defaultPublic=path.resolve(here,'../public');
export const modes=['plan','assets','release'];
const validID=/^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const allowed=/^cinema-assets\/[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+\.(png|jpg|jpeg|webp)$/i;
const validColor=/^#[0-9a-fA-F]{6}$/;
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const validatePath=(value)=>typeof value==='string'&&allowed.test(value)&&!value.includes('..')&&!value.includes('\\')&&!value.includes('%');

export function validateManifest(manifest,{mode='plan',publicDir=defaultPublic,voiceFile='',captionsFile='',approvalFile=''}={}){
  const errors=[];
  const fail=(msg)=>errors.push(msg);
  if(!modes.includes(mode))fail('Unknown preflight mode');
  if(manifest?.schemaVersion!==2||manifest?.fps!==60||manifest?.width!==1080||manifest?.height!==1920||manifest?.overlapFrames!==30)
    fail('Wrong source version or 1080x1920/60fps/30-overlap frame contract');
  if(!Array.isArray(manifest?.films)||manifest.films.length!==3) fail('Expected exactly three queued films');
  const filmIDs=new Set();let shotCount=0;let layerCount=0;
  for(const film of manifest?.films||[]){
    if(filmIDs.has(film.id))fail('Duplicate film '+film.id);filmIDs.add(film.id);
    if(!validID.test(film.id)||!validColor.test(film.accent)||film.fps!==60||film.width!==1080||film.height!==1920||film.overlapFrames!==30)
      fail('Invalid film contract '+film.id);
    if(!Array.isArray(film.shots)||film.shots.length!==9){fail('Film requires 9 shots: '+film.id);continue;}
    const ids=new Set();let start=0;
    for (const shot of film.shots){
      shotCount++;
      if(!validID.test(shot.id)||ids.has(shot.id))fail('Duplicate/invalid shot id '+film.id+'/'+shot.id);ids.add(shot.id);
      if(shot.durationFrames!==480||!shot.storyboard?.trim()||!shot.narrationCue?.trim()||!shot.headline?.trim())fail('Incomplete storyboard '+film.id+'/'+shot.id);
      for(const endpoint of [shot.camera?.from,shot.camera?.to]){
        if(!endpoint||!finite(endpoint.x,-180,180)||!finite(endpoint.y,-180,180)||!finite(endpoint.zoom,1,1.35)||!finite(endpoint.roll,-15,15))fail('Unsafe/incomplete camera '+film.id+'/'+shot.id);
      }
      for(const plane of [shot.focus?.from,shot.focus?.to]) if(!finite(plane,0,3))fail('Invalid focus plane '+film.id+'/'+shot.id);
      if(!Array.isArray(shot.layers)||shot.layers.length<4){fail('Four separate depth planes needed: '+film.id+'/'+shot.id);continue;}
      const depths=[], layers=new Set();
      for(const layer of shot.layers){
        layerCount++;
        if(!validID.test(layer.id)||layers.has(layer.id)) fail('Duplicate layer '+film.id+'/'+shot.id);layers.add(layer.id);
        if(!validatePath(layer.src))fail('Unsafe asset path '+layer.src);
        if(!finite(layer.depth,.1,2.8)||!finite(layer.opacity,0,1))fail('Invalid depth/opacity '+layer.src);
        depths.push(layer.depth);
        const r=layer.rect||{};
        if(!finite(r.x,-400,2000)||!finite(r.y,-400,2400)||!finite(r.width,100,2500)||!finite(r.height,100,3000))fail('Unsafe rect '+layer.src);
        const pivot=layer.pivot||{};
        if(!finite(pivot.x,0,1)||!finite(pivot.y,0,1))fail('Invalid pivot '+layer.src);
        const m=layer.motion||{};
        if(!['hold','drift','float','hinge','reveal','push'].includes(m.mode)||![m.amountX,m.amountY,m.rotation,m.rate,m.phase].every(x=>finite(x,-100,100)))fail('Invalid motion '+layer.src);
        if(!['normal','screen','multiply'].includes(layer.blend))fail('Invalid blend '+layer.src);
        if(!['pending','cleared'].includes(layer.rights?.status))fail('Invalid rights '+layer.src);
        if(mode==='assets'||mode==='release'){
          if(layer.rights?.status!=='cleared'||!layer.rights.evidence?.trim())fail('Rights not cleared '+layer.src);
          if(validatePath(layer.src)&&!fs.existsSync(path.join(publicDir,layer.src))) fail('Missing image '+layer.src);
        }
      }
      if(new Set(depths).size<3)fail('Missing real parallax separation '+film.id+'/'+shot.id);
      start+=shot.durationFrames-30;
    }
    if(start+30!==4080)fail('Film not 68 seconds at 60fps '+film.id);
  }
  if(mode==='release'){
    for(const [key,value] of [['voice',voiceFile],['captions',captionsFile],['approval',approvalFile]]){
      if(!value||!fs.existsSync(value))fail('Missing required final '+key+' artifact');
    }
    if(captionsFile&&fs.existsSync(captionsFile)){
      try{const cues=JSON.parse(fs.readFileSync(captionsFile,'utf8'));
        if(!Array.isArray(cues)||!cues.length||cues.some(c=>!finite(c.start,0,68)||!finite(c.end,0,68)||c.end<=c.start||!c.text?.trim()))fail('Missing/inaccurate caption timing');
      }catch{fail('Captions must be verified JSON timestamps');}
    }
    if(approvalFile&&fs.existsSync(approvalFile)){
      try{const a=JSON.parse(fs.readFileSync(approvalFile,'utf8'));
        if(a.approved!==true||!a.reviewer||!a.date)fail('Final user approval not verified');
      }catch{fail('Approval file must be valid JSON');}
    }
  }
  return {ok:errors.length===0,mode,films:filmIDs.size,shots:shotCount,layers:layerCount,errors};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const arg=(name,defaultVal='')=>{const k=process.argv.indexOf(name);return k>=0?process.argv[k+1]:defaultVal;};
  const mode=arg('--mode','plan');
  const file=arg('--manifest',defaultManifest);
  try{
    const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
    const result=validateManifest(manifest,{mode,publicDir:arg('--public',defaultPublic),voiceFile:arg('--voice'),captionsFile:arg('--captions'),approvalFile:arg('--approval')});
    console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
  }catch(e){console.error(String(e));process.exitCode=1;}
}
