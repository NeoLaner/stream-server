import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { EVENT_NAMES } from "../constants";

type Status = "success" | "fail" | "error";

export type UserDataApi = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  userId: string;
  role: "user" | "admin";
  createdAt: number;
  password: string;
  photo?: string;
  active: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  birthday?: string;
  phone?: number;
  location?: string;
};

export type UserDataRes = {
  status: Status;
  data: { user: Pick<UserDataApi, "_id" | "photo" | "name" | "userId"> };
};

export type MongooseObjectId = Types.ObjectId;

export type RoomData = {
  _id: Types.ObjectId;
  roomAuthor: Types.ObjectId;
  roomName: string;
  cover: string;
  isActive: boolean;
  isPrivate: boolean;
  videoLink: string;
  hasHardSubtitle: boolean;
  hasSoftSubtitle: boolean;
  subtitles: Array<string>;
  crossorigin: boolean;
};

export type RoomDataRes = {
  status: Status;
  data: {
    room: Omit<RoomData, "password">;
  };
};

export type RoomDataReq = Omit<RoomData, "_id" | "isActive">;

export type InstanceData = {
  _id: Types.ObjectId;
  rootRoom: Types.ObjectId;
  hostId: Types.ObjectId;
  password?: string;
  guests: {
    _id: string;
    userId: string;
    status: UserStatus;
  }[];
  // media: object;
  // messages
};

export type InstanceReq = {
  password?: string;
  rootRoomId: string;
};

export type InstanceRes = {
  status: Status;
  data: {
    instance: {
      _id: Types.ObjectId;
      hostId: Types.ObjectId;
      guests: InstanceData["guests"];
      rootRoom: Pick<
        RoomData,
        | "_id"
        | "cover"
        | "crossorigin"
        | "roomAuthor"
        | "roomName"
        | "subtitles"
        | "videoLink"
      >;
    };
  };
  //guests
  //messages
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

export type UserStatus =
  | "notReady"
  | "ready"
  | "waitingForData"
  | "disconnected";

export type MediaStatus = "played" | "paused";

export type UserSocketData = {
  eventType: `user_${string}` | "set_id" | "join_room" | "kick";
  payload: {
    userId: string;
    status: UserStatus;
    instanceId: string | string[];
  };
};

export type MediaCaused = "auto" | "manual";
export type MediaSocketData = {
  eventType: `media_${string}` | "set_id" | "join_room" | "kick";
  payload: {
    userId: string;
    status: MediaStatus;
    playedSeconds: number;
    caused?: MediaCaused;
    instanceId: string | string[];
  };
};

export type EventNames = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export type EventData<EventType extends EventNames> = {
  user_waiting_for_data: UserSocketData;
  user_ready: UserSocketData;
  user_disconnected: UserSocketData;
  media_paused: MediaSocketData;
  media_played: MediaSocketData;
  set_id: UserSocketData;
  join_room: UserSocketData;
  kick: UserSocketData;
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
