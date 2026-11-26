import React from 'react';
import {Composition} from 'remotion';
import {MicroLearningPilot} from './MicroLearningPilot';
import {SignalCutPilot} from './SignalCutPilot';
import {CinematicEngine} from './cinema/CinematicEngine';
import {cinematicPlan} from './cinema/plan';
import {durationOf, validateCinemaPlan} from './cinema/schema';
import {FluidDocumentary} from './episodes/FluidDocumentary';
import {fluidEpisodes, getDuration} from './episodes/episodePlans';
import {AssetDrivenFilm} from './asset-cinema/AssetDrivenFilm';
import {assetFilms} from './asset-cinema/assetPlans';
import {filmDuration} from './asset-cinema/types';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MicroLearningPilot"
      component={MicroLearningPilot}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={900}
      defaultProps={{narrationFile: ''}}
    />
    <Composition
      id="SignalCutPilot"
      component={SignalCutPilot}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={900}
      defaultProps={{narrationFile: ''}}
    />
    <Composition
      id="KairoCinematic60"
      component={CinematicEngine}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={durationOf(cinematicPlan)}
      defaultProps={{plan: cinematicPlan, narrationFile: '', bands: []}}
      calculateMetadata={({props}) => {
        const possiblePlan: unknown = props.plan;
        const plan = possiblePlan && typeof possiblePlan === 'object' && 'beats' in possiblePlan
          ? possiblePlan as typeof cinematicPlan
          : cinematicPlan;
        validateCinemaPlan(plan);
        return {durationInFrames: durationOf(plan)};
      }}
    />
    {fluidEpisodes.map((episode) => (
      <Composition
        key={episode.id}
        id={episode.id}
        component={FluidDocumentary}
        width={episode.width}
        height={episode.height}
        fps={episode.fps}
        durationInFrames={getDuration(episode)}
        defaultProps={{episode, narrationFile: ''}}
      />
    ))}
    {/* New asset-first compositions: clearly marked previews until rights, voice and QA pass. */}
    {assetFilms.map((film) => (
      <Composition
        key={film.id}
        id={film.id}
        component={AssetDrivenFilm}
        width={film.width}
        height={film.height}
        fps={film.fps}
        durationInFrames={filmDuration(film)}
        defaultProps={{film, narrationFile: '', strictAssets: false}}
      />
    ))}
  </>
);
