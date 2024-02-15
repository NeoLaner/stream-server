import express from "express";
import { protect } from "../controllers/authControl";

import { getCountRoom, getRoom, roomCreate } from "../controllers/roomControl";

const roomRouter = express.Router();

roomRouter.get("/count", getCountRoom);

roomRouter.use(protect);
roomRouter.get("/:id", getRoom);
roomRouter.post("/", roomCreate);

export default roomRouter;
