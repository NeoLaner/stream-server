import express from "express";
import { protect } from "../../../../libraries/auth/authControl";
import { getChat } from "../../domain/chatControl";

const chatRouter = express.Router();

chatRouter.use(protect);
// chatRouter.use(protectInstance);
chatRouter.get("/:instanceId", getChat);

export default chatRouter;
