import {
  GuestsData,
  UserNamespace,
  UserSocket,
  UserWsDataClientToServerEvents,
} from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import {
  disconnectController,
  disconnectPreviousSockets,
} from "./disconnectControl";

function updateGuestsData({
  guestsData,
  wsData,
  socket,
}: {
  guestsData: GuestsData;
  wsData: UserWsDataClientToServerEvents;
  socket: UserSocket;
}) {
  const foundIndex = guestsData.findIndex(
    (guest) => guest.userId === socket.data.user.userId
  );
  if (foundIndex !== -1)
    guestsData[foundIndex] = wsData.payload; // Update the data
  else guestsData[guestsData.length] = wsData.payload;
}

const guestsDataByRoomId: Record<string, GuestsData> = {};
const userSocketMapByNamespace: Record<string, Map<string, string>> = {};
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};

export function usersSocketControl(userNamespace: UserNamespace) {
  const namespaceName = "user";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userRoomMap = userRoomMapByNamespace[namespaceName];

  //Handlers
  async function joinRoomHandler(
    this: UserSocket,
    wsData: UserWsDataClientToServerEvents
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    disconnectPreviousSockets({
      namespace: userNamespace,
      namespaceName: "user",
      wsData,
      userSocketMap,
      userRoomMap,
    });
    await socket.join(roomId);
    userSocketMap.set(socket.data.user.userId, socket.id);
    userRoomMap.set(socket.data.user.userId, roomId);

    userNamespace.to(roomId).emit("user", wsData);
    if (!guestsDataByRoomId[roomId]) guestsDataByRoomId[roomId] = [];
    const guestsData = guestsDataByRoomId[roomId];
    updateGuestsData({ guestsData, wsData, socket });
    // console.log(guestsDataByRoomId);
  }

  function unsyncHandler(this: UserSocket) {
    const socket = this;
    const curSocketId = userSocketMap.get(socket.data.user.userId);
    if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
  }

  function readyHandler(
    this: UserSocket,
    wsData: UserWsDataClientToServerEvents
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    userNamespace.to(roomId).emit("user", wsData);
  }

  function waitingForDataHandler(
    this: UserSocket,
    wsData: UserWsDataClientToServerEvents
  ) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    userNamespace.to(roomId).emit("user", wsData);
  }

  function initialDataHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.emit(EVENT_NAMES.USER_INITIAL_DATA, guestsDataByRoomId[roomId]);
  }

  function disconnectHandler(this: UserSocket) {
    const socket = this;
    disconnectController({
      userNamespace,
      socket,
      guestsDataByRoomId,
    });
  }

  return {
    joinRoomHandler,
    unsyncHandler,
    readyHandler,
    waitingForDataHandler,
    initialDataHandler,
    disconnectHandler,
  };
}
