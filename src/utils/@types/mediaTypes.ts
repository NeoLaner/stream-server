import { Namespace, Socket } from "socket.io";
import type { RoomData, SocketData } from "./globalTypes";

// Define MediaEvents as a union of string literals
export type MediaEvents =
  | "updateUserMediaState"
  | "seek"
  | "play"
  | "pause"
  | "waitingForData"
  | "dataArrived"
  | "joinRoom"
  | "roomDataChanged"
  | "sourceDataChanged"
  | "chat:userMessaged";

type SourceData = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    addons: string[];
  };
  id: string;
  roomId: string;
  userId: string;
  videoLink: string | null;
  infoHash: string | null;
  fileIdx: number | null;
  mediaLinkId: string | null;
};

// Define specific payload types for each event
type SeekPayload = { videoTs: number };
type UserMessage = {
  textContent: string;
  type: "normal" | "normal:server" | "success" | "warning" | "danger";
  created_at: number;
  user: { userName: string; image: string; id: string };
};
// Create a mapping type to associate each event with its payload type
type MediaEventPayloads<K extends MediaEvents> = {
  updateUserMediaState: MediaUserState[];
  seek: SeekPayload;
  roomDataChanged: RoomData;
  sourceDataChanged: SourceData;
  play: undefined;
  pause: undefined;
  waitingForData: undefined;
  dataArrived: undefined;
  joinRoom: undefined;
  "chat:userMessaged": UserMessage;
}[K];

// MediaUserState definition
export type MediaUserState = {
  id: string; // User ID
  roomId: string;
  userName: string | null; // User name
  image: string | null;
  videoTs: number; // Timestamp for video
  playbackRate: number; // Playback rate of the video
  downloadSpeed: number; // Download speed
  waitForData: boolean; // If the user is waiting for data
  synced: boolean; // If the user is synced
  forceUnsync: boolean; // If the user is forced to be unsynced
  owner: boolean; // If the user is the owner
  host: boolean; // If the user is the host
  createdAt: number; // Timestamp when the user was created
};

export type WsDataCtS<K extends MediaEvents> = K extends "updateUserMediaState"
  ? {
      payload: Omit<
        MediaUserState,
        "id" | "roomId" | "userName" | "image" | "owner" | "host"
      >;
    }
  : { payload: MediaEventPayloads<K> };

export type WsDataCtSBaked<K extends MediaEvents> =
  K extends "updateUserMediaState"
    ? {
        payload: MediaUserState;
      }
    : { payload: MediaEventPayloads<K> };

export type WsDataStC<K extends MediaEvents> = K extends "updateUserMediaState"
  ? { payload: MediaUserState[] }
  : { payload: MediaEventPayloads<K> };
// Define client-to-server event handlers
export type MediaClientToServerEvents = {
  [K in MediaEvents]: MediaEventPayloads<K> extends undefined
    ? () => void
    : (wsData: WsDataCtS<K>) => void;
};

export type MediaClientToServerProtectedEvents = {
  [K in MediaEvents]: MediaEventPayloads<K> extends undefined
    ? () => void
    : (wsData: WsDataCtSBaked<K>) => void;
};
// Define server-to-client event handlers
export type MediaServerToClientEvents = {
  [K in MediaEvents]: MediaEventPayloads<K> extends undefined
    ? () => void
    : (wsData: WsDataStC<K>) => void;
};

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

export type ProtectedSocket = Socket<
  MediaClientToServerProtectedEvents,
  MediaServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;
