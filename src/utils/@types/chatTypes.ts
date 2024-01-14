import type { Namespace, Socket } from "socket.io";
import type { EventNames, SocketData, DefaultEvents } from "./globalTypes";

type ChatEvents = Extract<EventNames, `chat_${string}`> | DefaultEvents;

type UserWsDataClientToServer = { textContent: string };
type UserWsDataClientToServerAfterMiddlewares = UserWsDataClientToServer & {
  userId: string;
  userName: string;
  created_at: number;
};
type UserWsDataServerToClient = UserWsDataClientToServerAfterMiddlewares;

type ChatClientToServerEvents = Record<
  ChatEvents,
  (wsData: UserWsDataClientToServer) => void
>;

export type ChatClientToServerEventsAfterMiddlewares = Record<
  ChatEvents,
  (wsData: UserWsDataClientToServerAfterMiddlewares) => void
>;

export type ChatServerToClientEvents = Record<
  "chat",
  (wsData: UserWsDataServerToClient) => void
> & { initial_data: (wsData: UserWsDataServerToClient) => void };

type NamespaceSpecificInterServerEvents = object;

export type ChatNamespace = Namespace<
  ChatClientToServerEvents,
  ChatServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type ChatSocket = Socket<
  ChatClientToServerEvents,
  ChatServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type ChatSocketAfterMiddlewares = Socket<
  ChatClientToServerEventsAfterMiddlewares,
  ChatServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;
