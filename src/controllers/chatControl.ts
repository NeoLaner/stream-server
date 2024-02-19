import mongoose from "mongoose";
import Chat from "../models/chatModel";
import { ExpressMiddlewareFn } from "../utils/@types";
import { ChatDataApi, ChatRes, MessageData } from "../utils/@types/chatTypes";
import AppError from "../utils/classes/appError";
import catchAsync from "../utils/factory/catchAsync";

export const getChat: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    const { instanceId } = req.params;
    const chatId = new mongoose.Types.ObjectId(instanceId);
    const chatData = await Chat.findById(chatId);
    const chatDataWithMessages = (await chatData?.populate({
      path: "messages",
      options: { sort: { created_at: -1 }, limit: 100 }, // Optional: sort messages chronologically
    })) as ChatDataApi & { messages: MessageData[] };

    chatDataWithMessages.messages.reverse();
    if (!chatData)
      return next(new AppError("There is no instance with this id", 404));

    const respondData: ChatRes = {
      status: "success",
      data: {
        chat: chatDataWithMessages,
      },
    };

    res.status(200).send(respondData);
  }
);
