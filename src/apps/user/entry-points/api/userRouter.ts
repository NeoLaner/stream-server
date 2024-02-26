import express from "express";
import {
  login,
  logout,
  protect,
  signup,
  signupAsGuest,
} from "@/libraries/auth/authControl";
import {
  getCountUser,
  getUser,
  getUserViaToken,
} from "../../domain/usersControl";

const userRouter = express.Router();

userRouter.post("/signup/guest", signupAsGuest);
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/count", getCountUser);

userRouter.use(protect);
userRouter.get("/auth", getUserViaToken);
userRouter.get("/user/:id", getUser);
userRouter.get("/logout", logout);

export default userRouter;
