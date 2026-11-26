import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cameraAt,layerAt,ease,focusBlur,lightSweepX} from '../src/asset-cinema/motion.ts';
const from={x:-20,y:7,zoom:1.02,roll:-.2},to={x:37,y:-15,zoom:1.13,roll:.5};
const part={mode:'hinge',amountX:0,amountY:0,rotation:11,rate:.2,phase:0};
test('cubic easing uses exact endpoints and monotonic progression',()=>{
  assert.equal(ease(0),0);assert.equal(ease(1),1);
  const xs=Array.from({length:100},(_,i)=>ease(i/99));
  xs.forEach((x,i)=>{assert.ok(x>=0&&x<=1);if(i)assert.ok(x>=xs[i-1]);});
});
test('same frame yields the same camera path regardless of evaluation order',()=>{
  const frames=[220,0,470,100,220];
  const results=frames.map(f=>cameraAt(from,to,f,480));
  assert.deepEqual(results[0],results[4]);assert.deepEqual(results[1],from);
  assert.deepEqual(results[2],cameraAt(from,to,470,480));
});
test('camera end frame lands on configured endpoint',()=>{
  assert.deepEqual(cameraAt(from,to,479,480),to);
});
test('hinged character prop has deterministic rotation',()=>{
  const a=layerAt(part,80,60);const b=layerAt(part,80,60);
  assert.deepEqual(a,b);assert.equal(a.x,0);assert.ok(Math.abs(a.rotation)<=11);
});
test('focus and lighting values stay finite',()=>{
  for(const frame of [0,1,120,1200,4080]){
    assert.ok(Number.isFinite(focusBlur(.4,1.2)));
    assert.ok(Number.isFinite(lightSweepX(frame,60)));
  }
});
