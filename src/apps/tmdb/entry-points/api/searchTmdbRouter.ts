import express from "express";
import { protect } from "../../../../libraries/auth/authControl";
import { multiSearchForMedia } from "../../domain/searchTmdbControl";

const searchTmdbRouter = express.Router();

searchTmdbRouter.use(protect);
searchTmdbRouter.get("/search/:query", multiSearchForMedia);

export default searchTmdbRouter;
