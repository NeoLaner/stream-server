import { Namespace, Socket } from "socket.io";
import type { EventNames, SocketData, UserDataApi } from "./globalTypes";

type Status = "success" | "fail" | "error";

export type UserDataRes = {
  status: Status;
  data: { user: Pick<UserDataApi, "_id" | "photo" | "name" | "userId"> };
};

type DefaultEvents = "join_room" | "kick" | "initial_data" | "unsync";
type RemoveUserPrefix<T extends string> = T extends `user_${infer U}` ? U : T;
type UserStatus = RemoveUserPrefix<Extract<EventNames, `user_${string}`>>;

export type UserEvents =
  | Extract<EventNames, `user_${string}`>
  | DefaultEvents
  | "unsync";

export type UserWsDataClientToServer =
  | { payload?: { targetId?: string } }
  | undefined;

export type UserWsDataAfterMiddlewares = {
  payload: {
    status: UserStatus;
    userId: string;
    targetId?: string;
  };
};

export type UserClientToServerEvents = Record<
  UserEvents,
  (wsData: UserWsDataClientToServer) => void
>;

export type UserClientToServerEventsAfterMiddlewares = Record<
  UserEvents,
  (wsData: UserWsDataAfterMiddlewares) => void
>;

export type GuestsData = Array<UserWsDataAfterMiddlewares["payload"]>;

export type UserWsDataServerToClient = GuestsData;

export type UserServerToClientEvents = Record<
  "user",
  (wsData: UserWsDataServerToClient) => void
> & { initial_data: (wsData: UserWsDataServerToClient) => void };

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

export type UserSocketAfterMiddlewares = Socket<
  UserClientToServerEventsAfterMiddlewares,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type UserNamespaceAfterMiddlewares = Namespace<
  UserClientToServerEventsAfterMiddlewares,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;
