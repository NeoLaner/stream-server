import type { NextFunction, Request, Response } from "express";
import type {
  UserDataRes,
  UserEvents,
  UserClientToServerEvents,
  UserServerToClientEvents,
  GuestsData,
  UserNamespace,
  UserSocket,
  UserNamespaceAfterMiddlewares,
  UserSocketAfterMiddlewares,
  UserWsDataAfterMiddlewares,
  UserWsDataClientToServer,
  UserClientToServerEventsAfterMiddlewares,
  UserWsDataServerToClient,
} from "./userTypes";

import type {
  ChatRes,
  ChatDataApi,
  MessageData,
  ChatNamespace,
  ChatServerToClientEvents,
  ChatSocketAfterMiddlewares,
  ChatSocket,
  ChatClientToServerEventsAfterMiddlewares,
  ChatWsDataClientToServer,
  ChatWsDataClientToServerAfterMiddlewares,
  ChatWsDataServerToClient,
} from "./chatTypes";

import type {
  MediaNamespace,
  MediaClientToServerEvents,
  MediaServerToClientEvents,
  MediaSocket,
  MediaEvents,
  WsDataCtS,
  WsDataStC,
} from "./mediaTypes";

import type {
  InstanceLoginData,
  InstanceRes,
  InstanceReq,
  JwtPayloadInstance,
} from "./instanceTypes";

import type {
  UserDataApi,
  Status,
  RoomData,
  InstanceData,
  SocketData,
  UserStatus,
  VideoLink,
  MediaItem,
} from "./globalTypes";

export type { MediaItem };

export type { Status, RoomData, SocketData, UserStatus };

export type SignupApiParams = {
  name: string;
  userId: string;
  email: string;
  password: string;
};

export type SignInApiParams = {
  email: string;
  password: string;
};

export type LoginAsGuestApiParams = {
  name: string;
};

//User
export type {
  UserDataApi,
  UserDataRes,
  UserEvents,
  UserClientToServerEvents,
  UserServerToClientEvents,
  GuestsData,
  UserNamespace,
  UserSocket,
  UserNamespaceAfterMiddlewares,
  UserSocketAfterMiddlewares,
  UserWsDataAfterMiddlewares,
  UserWsDataClientToServer,
  UserClientToServerEventsAfterMiddlewares,
  UserWsDataServerToClient,
};

export type MongooseObjectId = string;

export type RoomDataRes = {
  status: Status;
  data: {
    room: Omit<RoomData, "password">;
  };
};

export type ErrorDataRes = {
  status: Status;
  message: string;
};

export interface DataToResponse<T extends Record<string, object>> {
  status: Status;
  data?: T;
  message?: string;
}

export type RoomDataReq = Omit<RoomData, "_id" | "isActive">;
export type { VideoLink };

export type {
  InstanceLoginData,
  InstanceRes,
  InstanceReq,
  JwtPayloadInstance,
  InstanceData,
};

//media
export type {
  MediaNamespace,
  MediaSocket,
  MediaClientToServerEvents,
  MediaServerToClientEvents,
  MediaEvents,
  WsDataCtS,
  WsDataStC,
};

//Chat
export type {
  ChatRes,
  ChatDataApi,
  MessageData,
  ChatNamespace,
  ChatServerToClientEvents,
  ChatSocketAfterMiddlewares,
  ChatSocket,
  ChatClientToServerEventsAfterMiddlewares,
  ChatWsDataClientToServer,
  ChatWsDataClientToServerAfterMiddlewares,
  ChatWsDataServerToClient,
};
//SOCKET
export type MessageDataApi = {
  textContent: string;
};

export type PauseVideoDataApi = {
  isPlaying: false;
};

export type CreateRoomReqDataApi = {
  roomName: string;
  videoLink: string;
};

//Just for api
export interface AppErrorType extends Error {
  statusCode: number;
  code?: number;
  status: string;
  isOperational: boolean;
  path?: string;
  value?: string;
  errmsg?: string;
  errors?: {
    error: { message: string };
  };
}

export type ExpressMiddlewareFn<ReturnType> = (
  req: Request,
  res: Response,
  next: NextFunction
) => ReturnType;

export type ExpressErrorMiddlewareFn<ReturnType> = (
  req: Request,
  res: Response,
  next: NextFunction,
  err: AppErrorType
) => ReturnType;
