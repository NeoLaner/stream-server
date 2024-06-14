import { Namespace, Socket } from "socket.io";
import type {
  DefaultEvents,
  EventNames,
  SocketData,
  UserDataApi,
  UserStatus,
} from "./globalTypes";

export type UserDataRes = Pick<UserDataApi, "id" | "name" | "image">;

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
    userName?: string | null;
    targetId?: string;
    image?: string | null;
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
