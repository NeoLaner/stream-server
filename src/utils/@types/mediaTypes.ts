import { Namespace, Socket } from "socket.io";
import type { DefaultEvents, EventNames, SocketData } from "./globalTypes";

export type MediaStatus = "played" | "paused";

export type MediaCaused = "auto" | "manual";

export type MediaEvents =
  | Extract<EventNames, `media_${string}`>
  | DefaultEvents;

export type MediaWsDataClientToServer = {
  payload: MediaData & { status: MediaStatus };
};

export type MediaData = {
  playedSeconds?: number;
  targetId?: string;
  status?: MediaStatus;
  caused?: MediaCaused;
  createdAt?: number;
};

export type MediaWsDataClientToServerAfterMiddlewares =
  MediaWsDataClientToServer;
export type MediaClientToServerEvents = Record<
  MediaEvents,
  (wsData: MediaWsDataClientToServer) => void
>;

export type MediaClientToServerEventsAfterMiddlewares = Record<
  MediaEvents,
  (wsData: MediaWsDataClientToServerAfterMiddlewares) => void
>;

export type MediaWsDataServerToClient =
  MediaWsDataClientToServerAfterMiddlewares;

export type MediaServerToClientEvents = Record<
  "media",
  (wsData: MediaWsDataClientToServer) => void
>;

type NamespaceSpecificInterServerEvents = object;

export type MediaNamespace = Namespace<
  MediaClientToServerEvents,
  MediaServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type MediaSocket = Socket<
  MediaClientToServerEvents,
  MediaServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

export type MediaSocketAfterMiddlewares = Socket<
  MediaClientToServerEventsAfterMiddlewares,
  MediaServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;
