import express from "express";
import { login, protect, signup } from "../controllers/authControl";
import { getUser } from "../controllers/usersControl";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter.use(protect);
userRouter.get("/auth", getUser);

export default userRouter;
