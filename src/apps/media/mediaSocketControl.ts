import { disconnectPreviousSockets } from "@/libraries/dc/disconnectControl";
import { MediaNamespace } from "@/utils/@types";
import {
  MediaSocket,
  MediaUserState,
  WsDataCtS,
  WsDataCtSBaked,
  WsDataStC,
} from "@/utils/@types/mediaTypes";
import {
  getUsersMediaStateCache,
  usersMediaCache,
} from "@/utils/factory/cache";

const aggregatedUpdates = new Map(); // Temporary storage for updates
const updateInterval = 1000; // 1 second interval for emitting updates
const expirySeconds = 3600;
const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function mediaSocketControl(mediaNamespace: MediaNamespace) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers

  function updateUserMediaState(
    this: MediaSocket,
    wsDataCtS: WsDataCtS<"updateUserMediaState">
  ) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();

    const wsDataCtSBaked = {
      payload: {
        ...wsDataCtS?.payload,
        id: socket.data.user.id,
        instanceId: socket.data.instance.id,
        userName: socket.data.user.name,
        image: socket.data.user.image,
        owner: socket.data.user.id === socket.data.instance.ownerId,
        host: false,
      },
    } as WsDataCtSBaked<"updateUserMediaState">;
    const userMediaState = wsDataCtSBaked.payload;

    // Get the current state from the cache
    const usersMediaData = getUsersMediaStateCache(roomId);

    // Find the user in the array and replace the old state with the new one
    const userIndex = usersMediaData.findIndex(
      (user) => user.id === userMediaState.id
    );

    if (userIndex !== -1) {
      usersMediaData[userIndex] = {
        ...userMediaState,
      };
    } else {
      // If the user is not found, add the new state
      usersMediaData.push(userMediaState);
    }

    // Update the cache with the new state
    usersMediaCache.set(roomId, usersMediaData, expirySeconds);

    // Store the aggregated updates
    aggregatedUpdates.set(roomId, usersMediaData);
  }

  // Emit aggregated updates periodically
  setInterval(() => {
    aggregatedUpdates.forEach(
      (usersMediaData: MediaUserState[], roomId: string) => {
        mediaNamespace
          .to(roomId)
          .emit("updateUserMediaState", { payload: usersMediaData });
      }
    );
    aggregatedUpdates.clear(); // Clear after emitting
  }, updateInterval);

  function playHandler(this: MediaSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("play");
  }

  function pauseHandler(this: MediaSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("pause");
  }

  function seekHandler(this: MediaSocket, wsData: WsDataStC<"seek">) {
    console.log("seek");

    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("seek", wsData);
  }

  function waitingForDataHandler(this: MediaSocket) {
    console.log("waitingForDataHandler");

    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.to(roomId).emit("waitingForData");
  }

  function dataArrivedHandler(this: MediaSocket) {
    console.log("dataArrivedHandler");
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    mediaNamespace.to(roomId).emit("dataArrived");
  }

  const disconnectPreviousSocketsHandler = (
    socket: MediaSocket,
    next: (err?: Error) => void
  ) => {
    disconnectPreviousSockets({
      socket,
      namespace: mediaNamespace,
      next,
      userSocketMap,
    });
  };
  function disconnectHandler(this: MediaSocket) {
    // const socket = this;
    // const roomId = socket.data.instance.id.toString();
    // const userId = socket.data.user.id;
    // // Get the current state from the cache
    // let usersMediaData = getUsersMediaStateCache(roomId);
    // // Remove the user from the array
    // usersMediaData = usersMediaData.filter((user) => user.id !== userId);
    // // Update the cache with the new state
    // usersMediaCache.set(roomId, usersMediaData, expirySeconds);
  }

  /*  
  function kickHandler(this: MediaSocket, wsData: MediaWsData) {
    const { targetId } = wsData.payload;
    if (!targetId) return;
    const curSocketId = userSocketMap.get(targetId);
    if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  }
*/

  return {
    updateUserMediaState,
    playHandler,
    pauseHandler,
    seekHandler,
    dataArrivedHandler,
    waitingForDataHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  };
}
