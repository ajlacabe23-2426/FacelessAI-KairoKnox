export type AudioBands = Readonly<{bass: number; mid: number; treble: number}>;

export type TelemetryPoint = Readonly<{label: string; value: string}>;

export type CinematicBeat = Readonly<{
  id: string;
  startFrame: number;
  durationInFrames: number;
  eyebrow: string;
  headline: string;
  explanation: string;
  accent: string;
  telemetry: readonly TelemetryPoint[];
}>;

export type CinemaPlan = Readonly<{
  id: string;
  fps: 60;
  width: 1080;
  height: 1920;
  overlapFrames: number;
  beats: readonly CinematicBeat[];
}>;

export const durationOf = (plan: CinemaPlan): number =>
  Math.max(...plan.beats.map((beat) => beat.startFrame + beat.durationInFrames));

export const validateCinemaPlan = (plan: CinemaPlan): void => {
  if (plan.fps !== 60 || plan.width !== 1080 || plan.height !== 1920) {
    throw new Error('Cinema production baseline is portrait 1080x1920 at 60fps.');
  }
  if (plan.overlapFrames < 12 || plan.overlapFrames > 48 || plan.beats.length < 2) {
    throw new Error('At least two scenes and an overlap of 12–48 frames are required.');
  }
  const ids = new Set<string>();
  plan.beats.forEach((beat, index) => {
    if (ids.has(beat.id)) throw new Error('Duplicate beat: ' + beat.id);
    ids.add(beat.id);
    if (!Number.isInteger(beat.startFrame) ||
        !Number.isInteger(beat.durationInFrames) ||
        beat.durationInFrames < plan.overlapFrames * 3) {
      throw new Error('Invalid frame bounds for ' + beat.id);
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(beat.accent) ||
        !beat.headline.trim() || !beat.explanation.trim() ||
        beat.telemetry.length < 2) {
      throw new Error('Invalid typography, accent, or data layer for ' + beat.id);
    }
    if (index === 0 && beat.startFrame !== 0) throw new Error('First beat starts at frame zero.');
    if (index > 0) {
      const prior = plan.beats[index - 1];
      if (beat.startFrame !== prior.startFrame + prior.durationInFrames - plan.overlapFrames) {
        throw new Error('Every scene must overlap its predecessor exactly.');
      }
    }
  });
};

export const audioBandsAt = (frames: readonly AudioBands[], frame: number): AudioBands => {
  const bands = frames[Math.min(Math.max(0, Math.floor(frame)), frames.length - 1)];
  if (!bands) return {bass: 0, mid: 0, treble: 0};
  const bound = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
  return {bass: bound(bands.bass), mid: bound(bands.mid), treble: bound(bands.treble)};
};
