import mongoose from "mongoose";
import { ChatDataApi } from "../../../utils/@types/chatTypes";
import Message from "./messageModel";

// Define enum for allowed link names

// Define schema for links

const chatSchema = new mongoose.Schema<ChatDataApi>(
  { active: { type: Boolean, default: true } },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSchema.virtual("messages", {
  ref: Message,
  foreignField: "chat",
  localField: "_id",
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
