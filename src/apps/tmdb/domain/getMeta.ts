import { DetailedMeta, MWMediaType } from "@/utils/@types/mw";
import {
  formatTMDBMeta,
  getEpisodes,
  getMediaDetails,
  getMediaPoster,
  mediaTypeToTMDB,
} from "./tmdbControl";
import {
  TMDBMediaResult,
  TMDBMovieData,
  TMDBSeasonMetaResult,
  TMDBShowData,
} from "../types/tmdb";
import AppError from "@/utils/classes/appError";

export const getMetaFromId = async function (
  type: MWMediaType,
  id: string,
  seasonId?: string
): Promise<DetailedMeta | null> {
  console.log(0);

  const details = await getMediaDetails(id, mediaTypeToTMDB(type));
  console.log(1);

  if (!details) throw new AppError("No media found with this id", 404);
  console.log(2);

  console.log(details);

  const imdbId = details.external_ids.imdb_id ?? undefined;

  let seasonData: TMDBSeasonMetaResult | undefined;

  if (type === MWMediaType.SERIES) {
    const seasons = (details as TMDBShowData).seasons;

    let selectedSeason = seasons.find((v) => v.id.toString() === seasonId);
    if (!selectedSeason) {
      selectedSeason = seasons.find((v) => v.season_number === 1);
    }

    if (selectedSeason) {
      const episodes = await getEpisodes(
        details.id.toString(),
        selectedSeason.season_number
      );

      seasonData = {
        id: selectedSeason.id.toString(),
        season_number: selectedSeason.season_number,
        title: selectedSeason.name,
        episodes,
      };
    }
  }

  const tmdbmeta = formatTMDBMetaResult(details, type);
  if (!tmdbmeta) return null;
  const meta = formatTMDBMeta(tmdbmeta, seasonData);
  if (!meta) return null;

  return {
    meta,
    imdbId,
    tmdbId: id,
  };
};

export function formatTMDBMetaResult(
  details: TMDBShowData | TMDBMovieData,
  type: MWMediaType
): TMDBMediaResult {
  if (type === MWMediaType.MOVIE) {
    const movie = details as TMDBMovieData;
    return {
      id: details.id,
      title: movie.title,
      object_type: mediaTypeToTMDB(type),
      poster: getMediaPoster(movie.poster_path) ?? undefined,
      original_release_year: new Date(movie.release_date).getFullYear(),
    };
  }
  if (type === MWMediaType.SERIES) {
    const show = details as TMDBShowData;
    return {
      id: details.id,
      title: show.name,
      object_type: mediaTypeToTMDB(type),
      seasons: show.seasons.map((v) => ({
        id: v.id,
        season_number: v.season_number,
        title: v.name,
      })),
      poster: getMediaPoster(show.poster_path) ?? undefined,
      original_release_year: new Date(show.first_air_date).getFullYear(),
    };
  }

  throw new Error("unsupported type");
}
