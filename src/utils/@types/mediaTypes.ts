import { Namespace, Socket } from "socket.io";
import type { EventNames, SocketData } from "./globalTypes";

export type MediaStatus = "played" | "paused";

export type DefaultEvents = "set_id" | "join_room" | "kick";
// eventType: `user_${string}` | "set_id" | "join_room" | "unsync";

export type MediaCaused = "auto" | "manual";

export type MediaEvents =
  | Extract<EventNames, `media_${string}`>
  | DefaultEvents;

export type MediaWsDataClientToServer = {
  payload: { playedSeconds?: number; targetId?: string; caused?: MediaCaused };
};

export type MediaWsDataClientToServerAfterMiddlewares =
  MediaWsDataClientToServer & { payload: { status: MediaStatus } };
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
