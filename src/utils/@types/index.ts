import { Types } from "mongoose";
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
  MediaNamespace,
  MediaCaused,
  MediaClientToServerEvents,
  MediaServerToClientEvents,
  MediaWsDataClientToServerAfterMiddlewares,
  MediaWsDataClientToServer,
  MediaStatus,
  MediaSocketAfterMiddlewares,
  MediaSocket,
  MediaClientToServerEventsAfterMiddlewares,
  MediaWsDataServerToClient,
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
  EventNames,
} from "./globalTypes";

export type { Status, RoomData, SocketData, UserStatus };

export type SignInApiParams = {
  email: "string";
  password: "string";
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

export type MongooseObjectId = Types.ObjectId;

export type RoomDataRes = {
  status: Status;
  data: {
    room: Omit<RoomData, "password">;
  };
};

export type RoomDataReq = Omit<RoomData, "_id" | "isActive">;

export {
  type InstanceLoginData,
  type InstanceRes,
  type InstanceReq,
  type JwtPayloadInstance,
  type InstanceData,
};

//media
export type {
  MediaNamespace,
  MediaWsDataClientToServerAfterMiddlewares,
  MediaWsDataClientToServer,
  MediaStatus,
  MediaSocketAfterMiddlewares,
  MediaSocket,
  MediaClientToServerEventsAfterMiddlewares,
  MediaWsDataServerToClient,
  MediaCaused,
  MediaClientToServerEvents,
  MediaServerToClientEvents,
};

//SOCKET
export type MessageDataApi = {
  senderId: string;
  messageId: string;
  name: string;
  textContent: string;
  image?: string;
  time?: string;
};

export type PauseVideoDataApi = {
  isPlaying: false;
};

export type EventData<EventType extends EventNames> = {
  user_waitingForData: UserWsDataServerToClient;
  user_ready: UserWsDataServerToClient;
  user_notReady: UserWsDataServerToClient;
  user_disconnected: UserWsDataServerToClient;
  initial_data: UserWsDataServerToClient;
  media_paused: MediaWsDataServerToClient;
  media_played: MediaWsDataServerToClient;
  media_seeked: MediaWsDataServerToClient;
  set_id: UserWsDataServerToClient;
  join_room: UserWsDataServerToClient;
  kick: MediaWsDataServerToClient;
  unsync: UserWsDataServerToClient;
  GET_USER: UserWsDataServerToClient;
  MESSAGE_EMITTED: UserWsDataServerToClient;
}[EventType];

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
