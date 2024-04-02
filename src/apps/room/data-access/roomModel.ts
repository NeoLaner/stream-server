import mongoose from "mongoose";
import { type RoomData } from "@/utils/@types";
import User from "../../user/data-access/userModel";

const mediaSchema = new mongoose.Schema<RoomData["media"]>({
  id: {
    type: String,
    required: [true, "The media id is required."],
  },
  title: {
    type: String,
    required: [true, "The media title is required."],
  },
  type: {
    type: String,
    enum: ["movie", "show"],
    required: [true, "The media type is required."],
  },
  year: {
    type: Number,
  },
  poster: {
    type: String,
  },
});

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
  media: {
    type: mediaSchema,
    required: function (this: RoomData) {
      return !this.videoLinks || this.videoLinks.length === 0; // Media is required if videoLinks are not provided
    },
    _id: false,
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
          required: [true, "You must provide the video link."],
        },
        _id: false,
      },
    ],

    required: function () {
      return !this.media || !this.media.id; // VideoLink is required if media is not provided
    },
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
