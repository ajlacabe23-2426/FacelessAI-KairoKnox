/** Pure, seekable motion math. Every result depends only on frame and immutable data. */
export type Vec2 = Readonly<{x: number; y: number}>;
export type CameraKey = Readonly<{x: number; y: number; zoom: number; roll: number}>;
export type MotionMode = 'hold' | 'drift' | 'float' | 'hinge' | 'reveal' | 'push';
export type LayerMotion = Readonly<{
  mode: MotionMode;
  amountX: number;
  amountY: number;
  rotation: number;
  rate: number;
  phase: number;
}>;
export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
export const clamp01 = (v: number): number => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const polynomial = (a: number, b: number, t: number): number => 3*(1-t)*(1-t)*t*a + 3*(1-t)*t*t*b + t*t*t;
/** Invert Bézier x by exactly 18 binary-search steps; deterministic per frame. */
export const ease = (p: number, x1 = .33, y1 = 0, x2 = .67, y2 = 1): number => {
  const target = clamp01(p); if(target===0||target===1)return target; let lo=0, hi=1;
  for(let i=0;i<18;i++){const mid=(lo+hi)/2;if(polynomial(x1,x2,mid)<target)lo=mid;else hi=mid;}
  return polynomial(y1,y2,(lo+hi)/2);
};
export const cameraAt = (start: CameraKey, end: CameraKey, localFrame: number, duration: number): CameraKey => {
  if(localFrame<=0)return start; if(localFrame>=duration-1)return end;
  const t=ease(localFrame/Math.max(1,duration-1));
  return {x:lerp(start.x,end.x,t),y:lerp(start.y,end.y,t),zoom:lerp(start.zoom,end.zoom,t),roll:lerp(start.roll,end.roll,t)};
};
export const layerAt = (motion: LayerMotion, frame: number, fps: number) => {
  const time=frame/fps;
  const wave=Math.sin(time*motion.rate*2*Math.PI+motion.phase);
  const slower=Math.cos(time*motion.rate*Math.PI+motion.phase);
  const reveal=ease(clamp01(frame/54));
  switch (motion.mode) {
    case 'hold': return {x:0,y:0,rotation:0,scale:1,opacity:1};
    case 'drift': return {x:motion.amountX*wave,y:motion.amountY*slower,rotation:motion.rotation*wave,scale:1,opacity:1};
    case 'float': return {x:motion.amountX*wave,y:motion.amountY*slower,rotation:motion.rotation*wave,scale:1+.006*wave,opacity:1};
    case 'hinge': return {x:0,y:0,rotation:motion.rotation*wave,scale:1,opacity:1};
    case 'reveal': return {x:(1-reveal)*motion.amountX,y:(1-reveal)*motion.amountY,rotation:(1-reveal)*motion.rotation,scale:1,opacity:reveal};
    case 'push': return {x:motion.amountX*reveal,y:motion.amountY*reveal,rotation:motion.rotation*reveal,scale:1+.05*reveal,opacity:1};
  }
};
/** For rack-focus from depth a to b: closer to the focus plane is sharper. */
export const focusBlur = (depth: number, focusPlane: number, maxBlur = 12): number =>
  clamp(Math.abs(depth-focusPlane)*3.7,0,maxBlur);
export const lightSweepX = (globalFrame: number, fps: number): number =>
  -280 + (globalFrame/fps*44)%1650;
