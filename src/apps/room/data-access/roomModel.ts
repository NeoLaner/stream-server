import mongoose from "mongoose";
import { type RoomData } from "@/utils/@types";
import User from "../../user/data-access/userModel";

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
  subtitles: {
    type: [String],
  },
  roomDescription: {
    type: String,
  },
  videoLinks: {
    type: [
      {
        isHardsub: {
          type: Boolean,
          default: false,
        },
        name: {
          type: String,
          default: "Primary",
        },
        videoLink: {
          type: String,
        },
        infoHash: {
          type: String,
        },
        fileIdx: {
          type: Number,
        },
        _id: false,
      },
    ],
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
