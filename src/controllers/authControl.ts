import mongoose from "mongoose";
import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/userModel";
import catchAsync from "../utils/factory/catchAsync";
import AppError from "../utils/classes/appError";
import { InstanceLoginData, type ExpressMiddlewareFn } from "../utils/@types";
import decodeToken from "../utils/factory/decodeToken";
import Instance from "../models/instanceModel";

function createToken(payload: object) {
  if (!process.env.SECRET_KEY) return;
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION_IN,
  });
  return token;
}

function createAndSendTheToken(
  jwtName: string,
  jwtPayload: object,
  statusCode: number,
  httpOnly: boolean,
  res: Response
) {
  const token = createToken(jwtPayload);

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRATION_IN) * 24 * 60 * 60 * 1000
    ),
    domain:
      process.env.NODE_ENV === "development"
        ? "127.0.0.1" // "localhost" gives an error
        : "5.34.202.131",
    path: "/", //sub domain
    sameSite: "strict", // lax for 1st party cookies and none for 3rd party cookies
    httpOnly: httpOnly, // can not manipulate the cookie from browser or read from client side
    //just send it over in https
    secure: false,
  };

  const respond = {
    status: "success",
    data: jwtPayload,
  };

  res.cookie(jwtName, token, cookieOptions);
  res.status(statusCode).json(respond);
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

    createAndSendTheToken(
      "jwt",
      {
        user: {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          photo: user.photo,
        },
      },
      200,
      true,
      res
    );
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

    createAndSendTheToken(
      "jwt",
      {
        user: {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          photo: user.photo,
        },
      },
      200,
      true,
      res
    );
  }
);

interface JwtPayloadUser {
  user: {
    _id: mongoose.ObjectId;
    userId: string;
    photo: string;
    name: string;
  };
  iat: number;
  exp: number;
}

interface JwtPayloadInstance {
  instance: InstanceLoginData;
  iat?: number;
  exp?: number;
}

export const loginInstance: ExpressMiddlewareFn<void> = catchAsync(
  //Task1-destructure and check the request body
  async function (req, res, next) {
    const { password } = req.body as {
      password?: unknown;
    };

    //Task2-get instanceId from url
    const instanceId = req.params.instanceId as unknown as mongoose.ObjectId;

    //Task3-find instance
    const instance = await Instance.findById(instanceId).select("+password");

    if (!instance)
      return next(
        new AppError(
          `There is no instance with this id: ${String(instanceId)}`,
          404
        )
      );
    //Task4-Check the ban list

    //Task5-Check password
    if (instance.password) {
      if (!password) return next(new AppError(`The room has password.`, 401));
      const checkPassword = await bcrypt.compare(
        String(password),
        instance.password
      );
      if (!checkPassword) return next(new AppError("Password is wrong", 401));
    }

    //
    if (!req.user) return next(new AppError("No user found.", 401));

    const jwtPayloadInstance: JwtPayloadInstance = {
      instance: { instanceId, userId: req.user.userId },
    };

    createAndSendTheToken("instanceJwt", jwtPayloadInstance, 200, false, res);
  }
);

export const protect = catchAsync(async function (req, res, next) {
  //get token from cookie
  const token = req.headers.cookie
    ?.split("; ")
    .filter((el) => el.includes("jwt="))[0]
    .split("jwt=")[1];
  //check token is exist
  if (!token)
    return next(
      new AppError("You are not logged in, please login to get access ", 401)
    );
  // verification token

  const decoded = await decodeToken<JwtPayloadUser>(token);

  // check if user is exist

  const curUser = await User.findById(decoded.user._id);

  if (!curUser) return next(new AppError("The user no longer exists", 401));

  // check if the password is not changed
  if (curUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError("The password has been changed please login again ", 401)
    );

  req.user = curUser;
  next();
});

export const protectInstance = catchAsync(async function (req, res, next) {
  //get token from cookie
  console.log(1);

  const token = req.headers.cookie
    ?.split("; ")
    .filter((el) => el.includes("instanceJwt="))[0]
    .split("instanceJwt=")[1];
  //check token is exist
  if (!token) return next(new AppError("No instance token found.", 401));
  // verification token

  const decoded = await decodeToken<JwtPayloadInstance>(token);

  // check if instance is exist

  const curInstance = await Instance.findById(decoded.instance.instanceId);

  if (!curInstance)
    return next(new AppError("The instance no longer exists", 401));

  // check the user is not in the ban list
  // check if the instance password is not changed

  req.instance = curInstance;
  next();
});
