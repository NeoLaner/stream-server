import mongoose from "mongoose";
import Chat from "../models/chatModel";
import { ExpressMiddlewareFn } from "../utils/@types";
import { ChatDataApi, ChatRes, MessageData } from "../utils/@types/chatTypes";
import catchAsync from "../utils/factory/catchAsync";

export const getChat: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const { instanceId } = req.params;
    const chatId = new mongoose.Types.ObjectId(instanceId);
    const chatData = await Chat.findById(chatId);
    if (!chatData)
      await Chat.create({
        _id: instanceId,
      });

    const chatDataWithMessages = (await chatData?.populate({
      path: "messages",
      options: { sort: { created_at: -1 }, limit: 100 }, // Optional: sort messages chronologically
    })) as ChatDataApi & { messages: MessageData[] };

    chatDataWithMessages.messages.reverse();

    const respondData: ChatRes = {
      status: "success",
      data: {
        chat: chatDataWithMessages,
      },
    };

    res.status(200).send(respondData);
  }
);
