import type {CameraKey, LayerMotion} from './motion';

export type AssetLayer = Readonly<{
  id: string;
  src: string; // Local path beneath video-engine/public. No network / data URLs.
  depth: number;
  rect: Readonly<{x: number; y: number; width: number; height: number}>;
  pivot: Readonly<{x: number; y: number}>; // unit 0..1, for segmented character limbs
  motion: LayerMotion;
  blend: 'normal' | 'screen' | 'multiply';
  opacity: number;
  rights: Readonly<{status: 'pending'|'cleared'; evidence: string}>;
}>;

export type AssetShot = Readonly<{
  id: string;
  label: string;
  headline: string;
  description: string;
  storyboard: string;
  durationFrames: number;
  camera: Readonly<{from: CameraKey; to: CameraKey}>;
  focus: Readonly<{from: number; to: number}>;
  layers: readonly AssetLayer[];
}>;

export type AssetFilm = Readonly<{
  id: string;
  title: string;
  accent: string;
  fps: 60;
  width: 1080;
  height: 1920;
  overlapFrames: 30;
  shots: readonly AssetShot[];
}>;

export const filmDuration = (film: AssetFilm): number =>
  film.shots.reduce((sum,shot)=>sum+shot.durationFrames,0)-(film.shots.length-1)*film.overlapFrames;

export const assertFilmShape = (film: AssetFilm): void => {
  if(film.fps!==60||film.width!==1080||film.height!==1920||film.overlapFrames!==30)
    throw new Error('Asset film requires native 1080x1920 @ 60fps and 30-frame overlap');
  if(!/^#[0-9A-Fa-f]{6}$/.test(film.accent)||film.shots.length!==9)
    throw new Error('Nine valid color-coded shots required');
  const shots=new Set<string>();
  for (const s of film.shots) {
    if(shots.has(s.id)||!s.headline||s.durationFrames!==480||s.layers.length<3)
      throw new Error('Invalid or duplicate storyboard shot: '+s.id);
    shots.add(s.id);
  }
};
