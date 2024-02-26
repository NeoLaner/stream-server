import { ExpressMiddlewareFn, MediaItem } from "../../../utils/@types";
import { SimpleCache } from "../../../utils/factory/cache";

import {
  formatTMDBMetaToMediaItem,
  formatTMDBSearchResult,
  multiSearch,
} from "./tmdbControl";
import { MWQuery } from "../../../utils/@types/mw";
import catchAsync from "../../../utils/factory/catchAsync";

const cache = new SimpleCache<MWQuery, MediaItem[]>();
cache.setCompare((a, b) => {
  return a.searchQuery.trim() === b.searchQuery.trim();
});
cache.initialize();

export const multiSearchForMedia: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const paramsQuery = req.params.query;
    const query = { searchQuery: paramsQuery };

    if (cache.has(query)) {
      res.status(200).send({
        status: "success",
        data: { data: cache.get(query) },
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
    res.status(200).send({
      status: "success",
      data: { data: sortedResult },
    });
  }
);

// export const getDetailsMedia: ExpressMiddlewareFn<void> = catchAsync(
//   async function (req, res) {
//     const paramsQuery = req.params.query;
//     const query = { searchQuery: paramsQuery };
//     await getmedid;
//   }
// );
