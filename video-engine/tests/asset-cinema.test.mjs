import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaultManifest,validateManifest} from '../scripts/check-assets.mjs';
const original=JSON.parse(fs.readFileSync(defaultManifest,'utf8'));
const clone=()=>structuredClone(original);

test('three films and 27 shots pass structural validation',()=>{
  const r=validateManifest(original);assert.equal(r.ok,true,JSON.stringify(r.errors));
  assert.equal(r.films,3);assert.equal(r.shots,27);assert.equal(r.layers,108);
});
test('all films exactly 4080 frames, preserve the 0.5-second overlap',()=>{
  for(const f of original.films){const frames=f.shots.reduce((a,s)=>a+s.durationFrames,0)-(f.shots.length-1)*f.overlapFrames;assert.equal(frames,4080);}
});
test('deny web URLs and folder escapes in asset paths',()=>{
  for(const src of ['https://a.com/foo.png','../../private.wav','cinema-assets/agent/hook/../../../oops.jpg']){
    const m=clone();m.films[0].shots[0].layers[0].src=src;
    assert.equal(validateManifest(m).ok,false,src);
  }
});
test('reject repeated scene IDs',()=>{
  const m=clone();m.films[0].shots[1].id='hook';assert.equal(validateManifest(m).ok,false);
});
test('reject aspect ratio/FPS drift',()=>{
  for(const [key,value] of [['fps',30],['width',720],['overlapFrames',0]]){
    const m=clone();m[key]=value;assert.equal(validateManifest(m).ok,false,key);
  }
});
test('reject identical depth layers',()=>{
  const m=clone();m.films[0].shots[0].layers.forEach(l=>l.depth=1);assert.equal(validateManifest(m).ok,false);
});
test('reject malformed focus and camera zoom',()=>{
  const m=clone();m.films[0].shots[0].camera.to.zoom=.5;assert.equal(validateManifest(m).ok,false);
});
test('production asset preflight fails closed without images/rights',()=>{
  const r=validateManifest(original,{mode:'assets'});assert.equal(r.ok,false);assert.match(r.errors.join('\n'),/Rights not cleared/);
});
test('final release refuses absent approved voice/captions/user review',()=>{
  const r=validateManifest(original,{mode:'release'});assert.equal(r.ok,false);
  assert.match(r.errors.join('\n'),/required final voice/);assert.match(r.errors.join('\n'),/required final captions/);assert.match(r.errors.join('\n'),/required final approval/);
});
