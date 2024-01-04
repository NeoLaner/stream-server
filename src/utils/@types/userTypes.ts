import { Types } from "mongoose";
import { EVENT_NAMES } from "../constants";

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

type Status = "success" | "fail" | "error";

export type UserDataRes = {
  status: Status;
  data: { user: Pick<UserDataApi, "_id" | "photo" | "name" | "userId"> };
};

type DefaultEvents = "set_id" | "join_room" | "kick";
type UserStatus = "notReady" | "ready" | "waitingForData" | "disconnected";

export type UserSocketData = {
  payload: {
    status: UserStatus;
  };
};

type EventNames = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export type UserEvents =
  | Extract<EventNames, `user_${string}`>
  | DefaultEvents
  | "unsync";

export type UserWsDataClientToServerEventsWithoutUserId = UserSocketData;
export type UserClientToServerEventsWithoutUserId = Record<
  UserEvents,
  (wsData: UserWsDataClientToServerEvents) => void
>;

export type UserWsDataClientToServerEvents = UserSocketData & {
  payload: { userId: string };
};
export type UserClientToServerEvents = Record<
  UserEvents,
  (wsData: UserWsDataClientToServerEvents) => void
>;

export type UserWsDataServerToClientEvents = UserSocketData & {
  payload: { userId: string };
};

export type UserServerToClientEvents = Record<
  "user",
  (wsData: UserWsDataServerToClientEvents) => void
>;
