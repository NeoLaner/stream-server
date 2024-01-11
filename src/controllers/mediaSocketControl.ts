import { MediaNamespace } from "../utils/@types";
import {
  MediaSocket,
  MediaWsDataClientToServerEventsWithoutUserId,
} from "../utils/@types/mediaTypes";
import { disconnectPreviousSockets } from "./disconnectControl";

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function mediaSocketControl(mediaNamespace: MediaNamespace) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers
  async function joinRoomHandler(this: MediaSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.userId, socket.id);
    // console.log(guestsDataByRoomId);
  }

  function kickHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerEventsWithoutUserId
  ) {
    const curSocketId = userSocketMap.get(wsData.payload.userId);
    if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  }

  function playHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerEventsWithoutUserId
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function pauseHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerEventsWithoutUserId
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function seekHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerEventsWithoutUserId
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  const disconnectPreviousSocketsHandler = (
    socket: MediaSocket,
    next: (err?: Error) => void
  ) =>
    disconnectPreviousSockets({
      socket,
      namespace: mediaNamespace,
      next,
      userSocketMap,
    });

  return {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    disconnectPreviousSocketsHandler,
  };
}
