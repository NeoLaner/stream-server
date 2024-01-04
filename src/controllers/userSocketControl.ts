import { Namespace, Socket } from "socket.io";
import {
  SocketData,
  UserClientToServerEvents,
  UserServerToClientEvents,
} from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import {
  disconnectController,
  disconnectPreviousSockets,
} from "./disconnectControl";
import {
  GuestsData,
  UserWsDataClientToServerEvents,
} from "../utils/@types/userTypes";

type UserSocket = Socket<
  UserClientToServerEvents,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

type UserNamespace = Namespace<
  UserClientToServerEvents,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>;

const guestsDataByRoomId: Record<string, GuestsData> = {};

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

type NamespaceSpecificInterServerEvents = object;

export function socketControl({
  socket,
  userNamespace,
  userSocketMapByNamespace,
  userRoomMapByNamespace,
}: {
  socket: UserSocket;
  userNamespace: UserNamespace;
  userSocketMapByNamespace: Record<string, Map<string, string>>;
  userRoomMapByNamespace: Record<string, Map<string, string>>;
}) {
  const namespaceName = "user";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userRoomMap = userRoomMapByNamespace[namespaceName];

  socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData) => {
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
  });

  socket.on(EVENT_NAMES.UNSYNC, () => {
    const curSocketId = userSocketMap.get(socket.data.user.userId);
    if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
  });

  socket.on(EVENT_NAMES.USER_READY, (wsData) => {
    const roomId = socket.data.instance._id.toString();
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.USER_WAITING_FOR_DATA, (wsData) => {
    const roomId = socket.data.instance._id.toString();
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.USER_INITIAL_DATA, () => {
    //NOTE:must be know roomId
    const roomId = socket.data.instance._id.toString();
    socket.emit(EVENT_NAMES.USER_INITIAL_DATA, guestsDataByRoomId[roomId]);
  });

  socket.on("disconnecting", () => {
    disconnectController({
      userNamespace,
      instanceId: socket.data.instance._id.toString(),
      userId: socket.data.user.userId,
    });
  });
}
