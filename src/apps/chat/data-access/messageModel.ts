import mongoose from "mongoose";
import { MessageData } from "../../../utils/@types/chatTypes";
// Define enum for allowed link names

// Define schema for links

const messageSchema = new mongoose.Schema<MessageData>({
  chat: {
    type: mongoose.Types.ObjectId,
    ref: "Chat", // Reference the Chat model
    required: true,
  },

  textContent: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  created_at: {
    type: Number,
    required: true,
  },
});

const Message = mongoose.model("message", messageSchema);

export default Message;
