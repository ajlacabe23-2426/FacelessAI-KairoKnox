import raw from '../../asset-cinema/shot-plans.json';
import type {AssetFilm} from './types';
import {assertFilmShape} from './types';

/** Runtime shape is guarded as well as the dependency-free offline preflight. */
export const assetFilms = raw.films as unknown as readonly AssetFilm[];
for (const film of assetFilms) assertFilmShape(film);
