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
import { MediaItem } from "@/apps/tmdb/types/tmdb";

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

export type MongooseObjectId = Types.ObjectId;

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

//Chat
export type {
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
  chat_msgSubmitted: UserWsDataServerToClient;
}[EventType];

export type CreateRoomReqDataApi = {
  roomName: string;
  videoLink: string;
};

export type { MediaItem };

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
