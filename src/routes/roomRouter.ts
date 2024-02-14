import express from "express";
import { protect } from "../controllers/authControl";

import { getRoom, roomCreate } from "../controllers/roomControl";

const roomRouter = express.Router();

roomRouter.use(protect);
roomRouter.get("/:id", getRoom);
roomRouter.post("/", roomCreate);

export default roomRouter;
