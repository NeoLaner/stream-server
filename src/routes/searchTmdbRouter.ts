import express from "express";
import { protect } from "../controllers/authControl";
import { multiSearchForMedia } from "../controllers/tmdb/searchTmdbControl";

const searchTmdbRouter = express.Router();

searchTmdbRouter.use(protect);
searchTmdbRouter.get("/search/:query", multiSearchForMedia);

export default searchTmdbRouter;
