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
import { getGuestsOfRoomData } from "@/utils/factory/cache";

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
    const roomId = socket.data.instance.id.toString();
    console.log("🍕 joinRoomHandler from media");

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.id, socket.id);
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
    console.log("playHandler");

    const socket = this;
    const roomId = socket.data.instance.id.toString();
    console.log(roomId);
    const isHost = socket.data.user.id === socket.data.instance.ownerId;
    if (!isHost) return null;
    const guests = getGuestsOfRoomData(roomId);
    const waitingGuests = guests.filter(
      (guest) => guest.status === "waitingForData"
    );
    if (waitingGuests.length > 0) return;
    wsData.payload.createdAt = Date.now();
    mediaNamespace.to(roomId).emit("media", wsData);
  }

  function pauseHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServerAfterMiddlewares
  ) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    const isHost = socket.data.user.id === socket.data.instance.ownerId;

    if (!isHost) return null;
    socket.to(roomId).emit("media", wsData);
  }

  function seekHandler(this: MediaSocket, wsData: MediaWsDataClientToServer) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function waitingForDataHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServer
  ) {
    console.log("waitingForDataHandler");

    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("media", wsData);
  }

  function receivedDataHandler(
    this: MediaSocket,
    wsData: MediaWsDataClientToServer
  ) {
    console.log("receivedDataHandler");

    const socket = this;
    const roomId = socket.data.instance.id.toString();
    wsData.payload.createdAt = Date.now();
    mediaNamespace.to(roomId).emit("media", wsData);
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
      case "media_receivedData":
        args.payload.status = "played";
        break;
      case "media_waitingForData":
        args.payload.status = "paused";
        break;
      default:
        break;
    }

    next();
  }

  function disconnectHandler(this: MediaSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    roomCapacityDec(roomId);
  }
  return {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    addStatusToPayload,
    receivedDataHandler,
    waitingForDataHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  };
}
