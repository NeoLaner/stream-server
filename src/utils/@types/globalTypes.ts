import { EVENT_NAMES } from "../constants";

export type Status = "success" | "fail" | "error";
export type VideoLink = {
  isHardsub?: boolean;
  name: string;
  videoLink?: string;
  infoHash?: string;
  fileIdx?: number;
};
export interface RoomData {
  _id: string;
  roomAuthor: string;
  roomName: string;
  cover?: string; // Optional field
  isActive?: boolean;
  isPrivate?: boolean;
  crossorigin?: boolean;
  subtitles?: string[]; // Array of strings
  roomDescription?: string; // Optional field
  videoLinks: VideoLink[];
}

export type AllowedLinkNames = "instagram" | "telegram" | "website" | "twitter";

export type UserDataApi = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  addons: string[];
};

export interface Room {
  id: string;
  // Add other fields as needed
}

export interface User {
  id: string;
  // Add other fields as needed
}

export interface Source {
  // Define the structure of your Source type
}

export interface InstanceData {
  id: string;
  password?: string | null;
  name: string;
  ownerId: string;
  roomId: string;
  online: boolean;
  timeWatched?: Date | null;
  season?: number | null;
  episode?: number | null;
  room: Room;
  owner: User;
  guests: string[];
  sources: Source[];
}

export type UserStatus =
  | "notReady"
  | "ready"
  | "waitingForData"
  | "disconnected";

export interface SocketData {
  user: UserDataApi;
  instance: InstanceData;
}

export type EventNames = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
export type DefaultEvents = "join_room" | "kick" | "initial_data" | "unsync";

export interface MediaItem {
  id: string;
  title: string;
  year?: number;
  poster?: string;
  type: "show" | "movie";
}
