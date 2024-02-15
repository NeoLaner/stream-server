import express from "express";
import {
  loginInstance,
  protect,
  protectInstance,
} from "../controllers/authControl";
import {
  createInstance,
  getCountInstance,
  getInstance,
} from "../controllers/instanceControl";

const instanceRouter = express.Router();

instanceRouter.get("/count", getCountInstance);

instanceRouter.use(protect);
instanceRouter.post("/:instanceId/login", loginInstance);

instanceRouter.post("/", createInstance);

instanceRouter.use(protectInstance);
instanceRouter.get("/:instanceId", getInstance);

export default instanceRouter;
