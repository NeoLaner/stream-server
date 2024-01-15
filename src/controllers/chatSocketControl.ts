import { type Event } from "socket.io";
import { disconnectPreviousSockets } from "./disconnectControl";
import {
  ChatNamespace,
  ChatSocket,
  ChatSocketAfterMiddlewares,
  ChatWsDataClientToServerAfterMiddlewares,
} from "../utils/@types";

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function chatSocketControl(chatNamespace: ChatNamespace) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers
  function joinRoomHandler(
    this: ChatSocketAfterMiddlewares,
    event: Event,
    next: (err?: Error) => void
  ) {
    const asyncHandler = async () => {
      const socket = this;
      const roomId = socket.data.instance._id.toString();
      if (userSocketMap.get(socket.data.user.userId) === socket.id)
        return next();
      await socket.join(roomId);
      userSocketMap.set(socket.data.user.userId, socket.id);
      // console.log(guestsDataByRoomId);
      next();
    };
    void asyncHandler();
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

  function msgSubHandler(
    this: ChatSocketAfterMiddlewares,
    wsData: ChatWsDataClientToServerAfterMiddlewares
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    chatNamespace.to(roomId).emit("chat", wsData);
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

  return {
    addUserDetails,
    joinRoomHandler,
    disconnectPreviousSocketsHandler,
    msgSubHandler,
    // kickHandler,
  };
}
