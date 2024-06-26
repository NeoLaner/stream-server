import { EVENT_NAMES } from "../constants";

export type Status = "success" | "fail" | "error";
export type VideoLink = {
  isHardsub?: boolean;
  name: string;
  videoLink?: string;
  infoHash?: string;
  fileIdx?: number;
};

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

export interface RoomData {
  type: string;
  id: string;
  name: string;
  ownerId: string;
  imdbId: string;
  online: boolean;
  timeWatched: Date | null;
  season: number | null;
  episode: number | null;
  isPublic: boolean;
  allowedGuestsId: string[];
  bannedGuestsId: string[];
}

export type UserStatus =
  | "notReady"
  | "ready"
  | "waitingForData"
  | "disconnected";

export interface SocketData {
  user: UserDataApi;
  room: RoomData;
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
