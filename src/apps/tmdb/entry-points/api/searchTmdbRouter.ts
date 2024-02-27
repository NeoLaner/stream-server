import express from "express";
import { protect } from "@/libraries/auth/authControl";
import { multiSearchForMedia } from "../../domain/searchTmdbControl";
import { getMetaFromId } from "../../domain/getMeta";
import { MWMediaType } from "@/utils/@types/mw";
import catchAsync from "@/utils/factory/catchAsync";

const searchTmdbRouter = express.Router();

searchTmdbRouter.use(protect);
searchTmdbRouter.get("/media/search/:query", multiSearchForMedia);

searchTmdbRouter.get(
  "/media/:id",
  catchAsync(async function (req, res) {
    const data = await getMetaFromId(MWMediaType.MOVIE, req.params.id);

    res.status(200).send(data);
  })
);

export default searchTmdbRouter;
