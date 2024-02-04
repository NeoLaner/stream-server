import express from "express";
import {
  login,
  protect,
  signup,
  signupAsGuest,
} from "../controllers/authControl";
import { getUser, getUserViaToken } from "../controllers/usersControl";

const userRouter = express.Router();

userRouter.get("/:id", getUser);

userRouter.post("/signup/guest", signupAsGuest);
userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter.use(protect);
userRouter.get("/auth", getUserViaToken);

export default userRouter;
