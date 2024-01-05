import { Types } from "mongoose";
import type { NextFunction, Request, Response } from "express";
import { EVENT_NAMES } from "../constants";
import {
  type UserSocketData,
  type UserDataRes,
  type UserEvents,
  type UserClientToServerEvents,
  type UserWsDataClientToServerEventsWithoutUserId,
  type UserServerToClientEvents,
  type UserWsDataServerToClientEvents,
  type GuestsData,
  type UserClientToServerEventsWithoutUserId,
  type UserNamespace,
  type UserSocket,
  type UserWsDataClientToServerEvents,
} from "./userTypes";
import {
  type InstanceLoginData,
  type InstanceRes,
  type InstanceReq,
  type JwtPayloadInstance,
} from "./instanceTypes";

import {
  type UserDataApi,
  type Status,
  type RoomData,
  type InstanceData,
  type SocketData,
  type UserStatus,
} from "./globalTypes";

export { type Status, type RoomData, type SocketData, type UserStatus };

export type SignInApiParams = {
  email: "string";
  password: "string";
};

//User
export {
  type UserDataApi,
  type UserDataRes,
  type UserSocketData,
  type UserEvents,
  type UserClientToServerEvents,
  type UserWsDataClientToServerEventsWithoutUserId,
  type UserServerToClientEvents,
  type GuestsData,
  type UserClientToServerEventsWithoutUserId,
  type UserNamespace,
  type UserSocket,
  type UserWsDataClientToServerEvents,
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

export type MediaStatus = "played" | "paused";

export type DefaultEvents = "set_id" | "join_room" | "kick";
// eventType: `user_${string}` | "set_id" | "join_room" | "unsync";

export type MediaEvents =
  | Extract<EventNames, `media_${string}`>
  | DefaultEvents;

export type MediaCaused = "auto" | "manual";
export type MediaSocketData = {
  eventType: `media_${string}` | DefaultEvents;
  payload: {
    userId: string;
    status: MediaStatus;
    playedSeconds: number;
    caused?: MediaCaused;
    instanceId: string | string[];
  };
};

export type KickSocketData = {
  eventType: "kick" | "unsync";
  payload: {
    userId: string;
    instanceId: string;
  };
};

export type EventNames = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export type EventData<EventType extends EventNames> = {
  user_waiting_for_data: UserWsDataServerToClientEvents;
  user_ready: UserWsDataServerToClientEvents;
  user_disconnected: UserWsDataServerToClientEvents;
  user_initial_data: UserWsDataServerToClientEvents;
  media_paused: MediaSocketData;
  media_played: MediaSocketData;
  media_seeked: MediaSocketData;
  set_id: UserSocketData;
  join_room: UserSocketData;
  kick: KickSocketData;
  unsync: KickSocketData;
  GET_USER: UserSocketData;
  MESSAGE_EMITTED: UserSocketData;
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
