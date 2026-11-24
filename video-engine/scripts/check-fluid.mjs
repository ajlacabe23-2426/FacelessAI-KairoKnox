import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const path of ['src/episodes/episodePlans.ts','src/episodes/FluidDocumentary.tsx']) {
  const src=readFileSync(path,'utf8');
  const banned=[
    [/Math\.random\s*\(/,'unseeded randomness'],
    [/\bDate\.now\s*\(/,'wall-clock time'],
    [/\brequestAnimationFrame\s*\(/,'nondeterministic animation'],
    [/\beas(?:e|ing)\s*:\s*['"]linear['"]/,'linear easing'],
    [/\bsetInterval\s*\(/,'wall-clock-driven animation'],
    [/\bsetTimeout\s*\(/,'timer-driven animations'],
    [/\btransitionTimingFunction\s*:\s*['"]linear['"]/,'CSS linear easing'],
  ];
  for(const [regex,desc] of banned)assert(!regex.test(src),path+' uses '+desc);
}
const plan=readFileSync('src/episodes/episodePlans.ts','utf8');
const render=readFileSync('src/episodes/FluidDocumentary.tsx','utf8');
assert.equal((plan.match(/id:'(?:NvidiaEconomyFluid60|AgentProgrammingFluid60|PromptEngineeringFluid60)'/g)||[]).length,3);
assert(plan.includes('overlap:30, fps:60') && plan.includes('width:1080,height:1920'),'All episodes must specify native 60fps 1080p');
assert(render.includes('CinematicCamera') && render.includes('FilmGrainOverlay') && render.includes('FluidTransition'),'Cinematic engine integration missing');
assert(render.includes('seededUnit(') && render.includes('springEnter(') && render.includes('cubicBezier('),'Physics + deterministic noise missing');
assert(render.includes('globalFrame={frame}') && render.includes('Math.sin(t'),'Global continuous motion missing');
assert(render.includes('ILLUSTRATIVE') && render.includes('VISUAL DIRECTOR CUT'),'Source/simulation transparency missing');
console.log('Three-episode fluidity and frame-determinism rules: PASS');
