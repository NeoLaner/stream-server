import express from "express";
import { getChat } from "../../domain/chatControl";

const chatRouter = express.Router();

// chatRouter.use(protectInstance);
chatRouter.get("/:instanceId", getChat);

export default chatRouter;
