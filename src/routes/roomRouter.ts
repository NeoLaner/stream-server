import express from "express";
import { protect } from "../controllers/authControl";

import { roomCreate } from "../controllers/roomControl";

const roomRouter = express.Router();

roomRouter.use(protect);
roomRouter.post("/", roomCreate);

export default roomRouter;
