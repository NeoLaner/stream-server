import mongoose from "mongoose";
import { InstanceData } from "@/utils/@types";
import User from "../../user/data-access/userModel";
import Room from "../../room/data-access/roomModel";

const instanceSchema = new mongoose.Schema<InstanceData>({
  rootRoom: {
    type: mongoose.Schema.ObjectId,
    ref: Room,
    lowercase: true,
    required: [true, "The instance must have a room as a root."],
  },
  hostId: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    lowercase: true,
    required: [true, "The instance must have a user as a host."],
  },
  guests: [
    {
      userId: String,
      status: String,
    },
  ],
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
