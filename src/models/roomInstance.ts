import mongoose from "mongoose";
import { RoomInstanceData } from "../utils/@types";
import User from "./userModel";

const roomSchema = new mongoose.Schema<RoomInstanceData>({
  hostId: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    lowercase: true,
    required: [true, "The room must have a user as a host."],
  },

  password: {
    type: String,
    minlength: [
      8,
      "Please provide a password which has at least 8 characters.",
    ],
    select: false,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
