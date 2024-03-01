import { ExpressMiddlewareFn } from "@/utils/@types";
import { SimpleCache } from "@/utils/factory/cache";

import {
  formatTMDBMetaToMediaItem,
  formatTMDBSearchResult,
  multiSearch,
} from "./tmdbControl";
import { MWQuery } from "@/utils/@types/mw";
import catchAsync from "@/utils/factory/catchAsync";
import AppError from "@/utils/classes/appError";
import { MediaItem } from "@/utils/@types";

const cache = new SimpleCache<MWQuery, MediaItem[]>();
cache.setCompare((a, b) => {
  return a.searchQuery.trim() === b.searchQuery.trim();
});
cache.initialize();

export const multiSearchForMedia: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    const paramsQuery = req.params.query;
    const query = { searchQuery: paramsQuery };

    if (cache.has(query)) {
      if (cache.get(query)?.length === 0)
        return next(new AppError("No media found.", 404));

      res.status(200).send({
        status: "success",
        data: { media: cache.get(query) },
      });
      return;
    }

    const { searchQuery } = query;

    const data = await multiSearch(searchQuery);

    const results = data.map((v) => {
      const formattedResult = formatTMDBSearchResult(v, v.media_type);
      return formatTMDBMetaToMediaItem(formattedResult);
    });

    const movieWithPosters = results.filter((movie) => movie.poster);
    const movieWithoutPosters = results.filter((movie) => !movie.poster);

    const sortedResult = movieWithPosters.concat(movieWithoutPosters);

    // cache results for 1 hour
    cache.set(query, sortedResult, 3600);

    if (sortedResult.length === 0)
      return next(new AppError("No media found.", 404));

    res.status(200).send({
      status: "success",
      data: { media: sortedResult },
    });
  }
);
