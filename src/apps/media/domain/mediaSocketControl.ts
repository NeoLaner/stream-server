import { Event } from "socket.io";
import { disconnectPreviousSockets } from "@/libraries/dc/disconnectControl";
import { MediaNamespace } from "@/utils/@types";
import {
  MediaEvents,
  MediaSocket,
  MediaWsDataClientToServerAfterMiddlewares,
  MediaWsDataClientToServer,
} from "@/utils/@types/mediaTypes";
import { roomCapacityDec } from "@/libraries/auth/authSocketControl";

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
  }

  function kickHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerAfterMiddlewares
  ) {
    const { targetId } = wsData.payload;
    if (!targetId) return;
    const curSocketId = userSocketMap.get(targetId);
    if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  }

  function playHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerAfterMiddlewares
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function pauseHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerAfterMiddlewares
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function seekHandler(this: MediaSocket, wsData: MediaWsDataClientToServer) {
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

  function addStatusToPayload(
    this: MediaSocket,
    event: Event,
    next: (err?: Error) => void
  ) {
    //
    if (!event[1]) event[1] = { payload: {} };
    const args = event[1] as MediaWsDataClientToServerAfterMiddlewares;
    const eventName = event[0] as MediaEvents;

    //for joinRoom
    switch (eventName) {
      case "media_paused":
        args.payload.status = "paused";
        break;
      case "media_played":
        args.payload.status = "played";
        break;
      case "media_seeked":
        args.payload.status = "paused";
        args.payload.caused = "manual";
        break;
      default:
        break;
    }

    next();
  }

  function disconnectHandler(this: MediaSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    roomCapacityDec(roomId);
  }
  return {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    addStatusToPayload,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  };
}
