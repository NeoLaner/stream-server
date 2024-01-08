import { Namespace, Socket } from "socket.io";
import { EventNames, SocketData } from "./globalTypes";

export type MediaStatus = "played" | "paused";

export type DefaultEvents = "set_id" | "join_room" | "kick";
// eventType: `user_${string}` | "set_id" | "join_room" | "unsync";

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

export type MediaEvents =
  | Extract<EventNames, `media_${string}`>
  | DefaultEvents;

export type MediaClientToServerEvents = Record<
  MediaEvents,
  (wsData: MediaSocketData) => void
>;

export type MediaServerToClientEvents = Record<
  "media",
  (wsData: MediaSocketData) => void
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

export type MediaWsDataClientToServerEventsWithoutUserId = MediaSocketData;
export type MediaWsDataServerToClientEvents = MediaSocketData;
