import express from "express";
import { protect } from "../controllers/authControl";
import { getChat } from "../controllers/chatControl";

const chatRouter = express.Router();

chatRouter.use(protect);
// chatRouter.use(protectInstance);
chatRouter.get("/:instanceId", getChat);

export default chatRouter;
