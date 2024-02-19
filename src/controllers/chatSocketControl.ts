import { type Event } from "socket.io";
import { disconnectPreviousSockets } from "./disconnectControl";
import {
  ChatNamespace,
  ChatSocket,
  ChatSocketAfterMiddlewares,
  ChatWsDataClientToServerAfterMiddlewares,
} from "../utils/@types";
import { roomCapacityDec } from "./authSocketControl";
import Chat from "../models/chatModel";
import Message from "../models/messageModel";

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function chatSocketControl(chatNamespace: ChatNamespace) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers
  async function joinRoomHandler(this: ChatSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.userId, socket.id);
  }

  function addUserDetails(
    this: ChatSocket,
    event: Event,
    next: (err?: Error) => void
  ) {
    const socket = this;

    //
    if (!event[1]) event[1] = { payload: { userId: socket.data.user.userId } };
    const args = event[1] as ChatWsDataClientToServerAfterMiddlewares;
    event[1] = {
      ...args,
      userId: socket.data.user.userId,
      userName: socket.data.user.name,
      created_at: Date.now(),
    };
    next();
  }

  async function msgSubHandler(
    this: ChatSocketAfterMiddlewares,
    wsData: ChatWsDataClientToServerAfterMiddlewares
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    chatNamespace.to(roomId).emit("chat", wsData);
    try {
      let chat = await Chat.findById(socket.data.instance._id);
      if (!chat)
        chat = await Chat.create({
          _id: socket.data.instance._id,
        });

      await Message.create({ chat: socket.data.instance._id, ...wsData });
    } catch (error) {
      // Handle errors appropriately
      console.error("Error saving message:", error);
    }
  }
  // function kickHandler(
  //   this: ChatSocketAfterMiddlewares,
  //   wsData: MediaWsDataClientToServerAfterMiddlewares
  // ) {
  //   const { targetId } = wsData.payload;
  //   if (!targetId) return;
  //   const curSocketId = userSocketMap.get(targetId);
  //   if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  // }

  const disconnectPreviousSocketsHandler = (
    socket: ChatSocketAfterMiddlewares,
    next: (err?: Error) => void
  ) =>
    disconnectPreviousSockets({
      socket,
      namespace: chatNamespace,
      next,
      userSocketMap,
    });

  function disconnectHandler(this: ChatSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    roomCapacityDec(roomId);
  }

  return {
    addUserDetails,
    joinRoomHandler,
    disconnectPreviousSocketsHandler,
    msgSubHandler,
    disconnectHandler,
    // kickHandler,
  };
}
