import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import catchAsync from "../utils/factory/catchAsync";
import AppError from "../utils/classes/appError";
import { ExpressMiddlewareFn, UserDataApi } from "../utils/@types";

function createToken(id: Types.ObjectId) {
  if (!process.env.SECRET_KEY) return;
  const token = jwt.sign(
    {
      id,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRATION_IN,
    }
  );
  return token;
}

function createAndSendTheToken(
  user: UserDataApi,
  statusCode: number,
  res: Response
) {
  const token = createToken(user._id);

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRATION_IN) * 24 * 60 * 60 * 1000
    ),
    domain:
      process.env.NODE_ENV === "development"
        ? "localhost"
        : process.env.CLIENT_SERVER,
    path: "/", //sub domain
    sameSite: "lax",
    // can not manipulate the cookie from browser
    httpOnly: true,
    //just send it over in https
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: {
        name: user.name,
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    },
  });
}

export const signup: ExpressMiddlewareFn<void> = catchAsync(
  async function signup(req, res) {
    interface Req {
      name: unknown;
      email: unknown;
      password: unknown;
      userId: unknown;
    }
    const { name, email, password, userId } = req.body as Req;
    const request = {
      name,
      email,
      password,
      userId,
    };

    const user = await User.create(request);

    createAndSendTheToken(user, 200, res);
  }
);

export const login: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    const { email, password } = req.body as {
      email: unknown;
      password: unknown;
    };

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new AppError("email or password is wrong", 401));
    const checkPassword = await bcrypt.compare(String(password), user.password);
    if (!checkPassword)
      return next(new AppError("email or password is wrong", 401));

    createAndSendTheToken(user, 200, res);
  }
);

console.log(
  process.env.JWT_EXPIRATION_IN,
  process.env.JWT_COOKIE_EXPIRATION_IN
);
