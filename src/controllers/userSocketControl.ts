import { Namespace, Socket } from "socket.io";
import { UserEvents, UserSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import { disconnectPreviousSockets } from "./disconnectControl";

const guestsDataByRoomId: Record<string, Array<UserSocketData["payload"]>> = {};

function updateGuestsData({
  guestsData,
  wsData,
}: {
  guestsData: Array<UserSocketData["payload"]>;
  wsData: UserSocketData;
}) {
  const foundIndex = guestsData.findIndex(
    (guest) => guest.userId === wsData.payload.userId
  );
  if (foundIndex !== -1)
    guestsData[foundIndex] = wsData.payload; // Update the data
  else guestsData[guestsData.length] = wsData.payload;
}

type UserClientToServerEvents = Record<
  UserEvents,
  (wsData: UserSocketData) => void
>;

type UserServerToClientEvents = Record<
  "user",
  (wsData: UserSocketData) => void
>;

export function socketControl({
  socket,
  userNamespace,
  userSocketMapByNamespace,
  userRoomMapByNamespace,
}: {
  socket: Socket;
  userNamespace: Namespace<UserClientToServerEvents, UserServerToClientEvents>;
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

  socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    disconnectPreviousSockets({
      namespace: userNamespace,
      namespaceName: "user",
      wsData,
      userSocketMap,
      userRoomMap,
    });
    await socket.join(roomId);
    userSocketMap.set(wsData.payload.userId, socket.id);
    userRoomMap.set(wsData.payload.userId, roomId);

    userNamespace.to(roomId).emit("user", wsData);
    if (!guestsDataByRoomId[roomId]) guestsDataByRoomId[roomId] = [];
    const guestsData = guestsDataByRoomId[roomId];
    updateGuestsData({ guestsData, wsData });
    console.log(guestsDataByRoomId);
  });

  socket.on(EVENT_NAMES.UNSYNC, (wsData: UserSocketData) => {
    const curSocketId = userSocketMap.get(wsData.payload.userId);
    if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
  });

  socket.on(EVENT_NAMES.USER_READY, (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.USER_WAITING_FOR_DATA, (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.USER_INITIAL_DATA, () => {
    //NOTE:must be know roomId
    // const roomId = userSocketMap.get()
    // socket.emit(EVENT_NAMES.USER_INITIAL_DATA, guestsDataByRoomId[]);
  });
  // socket.on("disconnecting", async () => {
  //   await disconnectController({
  //     userNamespace,
  //     instanceId: wsData.payload.instanceId,
  //     userId: wsData.payload.userId,
  //   });
  // });
}
