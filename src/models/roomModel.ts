import mongoose from "mongoose";
import { type RoomData } from "../utils/@types";
import User from "./userModel";

const roomSchema = new mongoose.Schema<RoomData>({
  roomName: {
    type: String,
    required: [true, "The room must has a name."],
  },

  roomAuthor: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    lowercase: true,
    required: [true, "The room must have a user as a host."],
  },

  videoLink: {
    type: String,
    required: [true, "The room must have video link attached."],
  },

  cover: {
    type: String,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  isPrivate: {
    type: Boolean,
    default: false,
  },

  crossorigin: {
    type: Boolean,
    default: false,
  },

  hasSoftSubtitle: {
    type: Boolean,
    default: false,
  },

  hasHardSubtitle: { type: Boolean, default: false },
  subtitles: { type: [String] },

  roomDescription: {
    type: String,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
