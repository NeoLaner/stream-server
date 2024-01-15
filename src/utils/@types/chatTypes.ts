import type { Namespace, Socket } from "socket.io";
import type { EventNames, SocketData, DefaultEvents } from "./globalTypes";

type ChatEvents = Extract<EventNames, `chat_${string}`> | DefaultEvents;

export type ChatWsDataClientToServer = { textContent: string };
export type ChatWsDataClientToServerAfterMiddlewares =
  ChatWsDataClientToServer & {
    userId: string;
    userName: string;
    created_at: number;
  };
export type ChatWsDataServerToClient = ChatWsDataClientToServerAfterMiddlewares;

type ChatClientToServerEvents = Record<
  ChatEvents,
  (wsData: ChatWsDataClientToServer) => void
>;

export type ChatClientToServerEventsAfterMiddlewares = Record<
  ChatEvents,
  (wsData: ChatWsDataClientToServerAfterMiddlewares) => void
>;

export type ChatServerToClientEvents = Record<
  "chat",
  (wsData: ChatWsDataServerToClient) => void
> & { initial_data: (wsData: ChatWsDataServerToClient) => void };

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
