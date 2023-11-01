import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import catchAsync from "../utils/factory/catchAsync";
import AppError from "../utils/classes/appError";
import { ExpressMiddlewareFn, UserDataApi } from "../utils/@types";

function createToken(payload: object) {
  if (!process.env.SECRET_KEY) return;
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION_IN,
  });
  return token;
}

function createAndSendTheToken(
  user: UserDataApi,
  statusCode: number,
  res: Response
) {
  const token = createToken({
    _id: user._id,
    userId: user.userId,
    name: user.name,
    photo: user.photo,
  });

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRATION_IN) * 24 * 60 * 60 * 1000
    ),
    domain:
      process.env.NODE_ENV === "development"
        ? "127.0.0.1" // "localhost" gives an error
        : process.env.CLIENT_SERVER,
    path: "/", //sub domain
    sameSite: "lax", // lax for 1st party cookies and none for 3rd party cookies
    httpOnly: true, // can not manipulate the cookie from browser or read from client side
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

interface JwtPayload {
  _id: mongoose.ObjectId;
  userId: string;
  photo: string;
  name: string;
  iat: number;
  exp: number;
}

export const protect = catchAsync(async function (req, res, next) {
  let token;
  //check token is exist
  if (req.headers.cookie?.startsWith("jwt=")) {
    token = req.headers.cookie?.split("jwt=")[1];
  }
  if (!token)
    return next(
      new AppError("You are not logged in, please login to get access ", 401)
    );
  // verification token
  if (!process.env.SECRET_KEY) return;
  const verifyAsync = promisify(jwt.verify) as unknown as (
    token: string,
    key: string
  ) => Promise<JwtPayload>;
  const decoded = await verifyAsync(token, process.env.SECRET_KEY);

  // check if user is exist

  const curUser = await User.findById(decoded._id);

  if (!curUser) return next(new AppError("The user no longer exists", 401));

  // check if the password is not changed
  if (curUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError("The password has been changed please login again ", 401)
    );

  req.user = curUser;
  next();
});
