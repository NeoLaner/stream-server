import mongoose from "mongoose";
import { InstanceData } from "../utils/@types";
import User from "./userModel";
import Room from "./roomModel";

const instanceSchema = new mongoose.Schema<InstanceData>({
  rootRoom: {
    type: mongoose.Schema.ObjectId,
    ref: Room,
    lowercase: true,
    required: [true, "The room must have a room as a root."],
  },
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

const Instance = mongoose.model("Instance", instanceSchema);

export default Instance;
