import express from "express";
import { loginInstance, protect } from "../controllers/authControl";
import { createInstance, getInstance } from "../controllers/instanceControl";

const instanceRouter = express.Router();

instanceRouter.use(protect);
instanceRouter.post("/:instanceId/login", loginInstance);

instanceRouter.post("/", createInstance);
instanceRouter.get("/:instanceId", getInstance);

export default instanceRouter;
