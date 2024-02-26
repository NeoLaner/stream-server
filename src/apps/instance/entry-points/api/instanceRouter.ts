import express from "express";
import {
  loginInstance,
  protect,
  protectInstance,
} from "@/libraries/auth/authControl";
import {
  createInstance,
  getCountInstance,
  getInstance,
} from "../../domain/instanceControl";

const instanceRouter = express.Router();

instanceRouter.get("/count", getCountInstance);

instanceRouter.use(protect);
instanceRouter.post("/:instanceId/login", loginInstance);

instanceRouter.post("/", createInstance);

instanceRouter.use(protectInstance);
instanceRouter.get("/:instanceId", getInstance);

export default instanceRouter;
