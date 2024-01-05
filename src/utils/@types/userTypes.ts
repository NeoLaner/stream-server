import { Namespace, Socket } from "socket.io";
import { EVENT_NAMES } from "../constants";
import { type SocketData, type UserDataApi } from "./globalTypes";

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

export type GuestsData = Array<UserWsDataClientToServerEvents["payload"]>;

export type UserServerToClientEvents = Record<
  "user",
  (wsData: UserWsDataServerToClientEvents) => void
> & { user_initial_data: (wsData: GuestsData) => void };

type NamespaceSpecificInterServerEvents = object;

export type UserSocket = Socket<
  UserClientToServerEvents,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type UserNamespace = Namespace<
  UserClientToServerEvents,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;
