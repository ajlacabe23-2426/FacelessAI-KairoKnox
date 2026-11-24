import {readFileSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('src/cinema');
const listFiles = (directory) => readdirSync(directory, {withFileTypes: true}).flatMap((item) => {
  const path = join(directory, item.name);
  return item.isDirectory() ? listFiles(path) : /\.(ts|tsx)$/.test(path) ? [path] : [];
});
const sourceFiles = listFiles(root);
const combined = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const blocked = [
  {pattern: /Math\.random\s*\(/, description: 'unseeded randomness'},
  {pattern: /Date\.now\s*\(/, description: 'wall-clock-dependent frame'},
  {pattern: /requestAnimationFrame\s*\(/, description: 'browser animation loop'},
  {pattern: /setInterval\s*\(/, description: 'timer-dependent frame'},
  {pattern: /performance\.now\s*\(/, description: 'nondeterministic timing'},
  {pattern: /\beas(?:e|ing)\s*:\s*['"]linear['"]/, description: 'linear easing'},
  {pattern: /transitionTimingFunction\s*:\s*['"]linear['"]/, description: 'linear CSS easing'},
  {pattern: /transition\s*:\s*['"][^'"]*\blinear\b/, description: 'linear CSS transition'},
];
for (const {pattern, description} of blocked) {
  assert(!pattern.test(combined), 'Forbidden motion primitive: ' + description);
}
for (const name of ['CinematicCamera', 'FilmGrainOverlay', 'KineticText',
  'FluidTransition', 'ParallaxStage', 'TelemetryHUD']) {
  assert(combined.includes('export const ' + name + ':'), 'Missing reusable component: ' + name);
}
assert(combined.includes('spring({'), 'Spring motion is mandatory.');
assert(combined.includes('cubicBezier('), 'Custom cubic Bézier motion is mandatory.');
assert(combined.includes('useCurrentFrame()'), 'Rendering must sample the Remotion frame clock.');
assert(combined.includes('audioBandsAt('), 'Frame-indexed audio data driver is missing.');
assert(combined.includes('ILLUSTRATIVE DEMO'), 'Demonstration labeling must remain visible.');
assert(combined.includes('width: 1080') && combined.includes('height: 1920') &&
  combined.includes('fps: 60'), '60fps portrait production profile is required.');
console.log('CINEMA MOTION GUARDRAILS: PASS (' + sourceFiles.length + ' typed sources)');
