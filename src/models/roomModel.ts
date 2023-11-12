import mongoose from "mongoose";
import { RoomData } from "../utils/@types/index";
import User from "./userModel";

const roomSchema = new mongoose.Schema<RoomData>({
  roomName: {
    type: String,
    required: [true, "The room must has a name."],
  },

  hostId: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    lowercase: true,
    required: [true, "The room must have a user as a host."],
  },

  roomId: {
    type: String,
    required: [true, "The room must have unique id."],
    unique: true,
    lowercase: true,
  },

  videoLink: {
    type: String,
  },

  bgPhoto: {
    type: String,
    default: null,
  },

  password: {
    type: String,
    minlength: [
      8,
      "Please provide a password which has at least 8 characters.",
    ],
    select: false,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  // aboutUser: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: AboutUser,
  // },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
