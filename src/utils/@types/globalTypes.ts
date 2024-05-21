import { Types } from "mongoose";
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
  _id: Types.ObjectId;
  roomAuthor: Types.ObjectId;
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
  _id: Types.ObjectId;
  name: string;
  email: string;
  userId: string;
  role: "user" | "admin";
  createdAt: number;
  password: string;
  photo?: string;
  active: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  birthday?: string;
  phone?: number;
  location?: string;
  aboutUser: string;
  links: { linkName: AllowedLinkNames; link: string }[];
};

export type InstanceData = {
  _id: Types.ObjectId;
  rootRoom: Types.ObjectId;
  hostId: Types.ObjectId;
  password?: string;
  guests: {
    _id: string;
    userId: string;
    status: UserStatus;
  }[];
  // media: object;
  // messages
};

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
