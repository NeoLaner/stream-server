/*
import { Namespace, Socket } from "socket.io";
import { UserSocketData } from "../utils/@types";
import Instance from "../models/instanceModel";
import { EVENT_NAMES } from "../utils/constants";
import {
  disconnectController,
  disconnectPreviousSockets,
} from "./disconnectControl";



type UserSocketControl = {
  userNamespace: Namespace;
  socket: Socket;
  wsData: UserSocketData;
  userRoomMapByNamespace: Record<string, Map<string, string>>;
};
export async function userSocketControl({
  userNamespace,
  socket,
  wsData,
  userRoomMapByNamespace,
}: UserSocketControl) {
  const roomId = wsData.payload.instanceId as string;
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "user";
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userRoomMapByNamespace[namespaceName];
  const curSocketId = userSocketMap.get(wsData.payload.userId);
  switch (wsData.eventType) {
    case EVENT_NAMES.JOIN_ROOM:
      disconnectPreviousSockets({
        namespace: userNamespace,
        namespaceName: "user",
        wsData,
        userSocketMap,
      });
      await socket.join(roomId);
      userSocketMap.set(wsData.payload.userId, socket.id);
      userNamespace.to(roomId).emit("user", wsData);
      break;
    case EVENT_NAMES.UNSYNC:
      if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
      break;
    default:
      userNamespace.to(roomId).emit("user", wsData);
      break;
  }

  socket.on("disconnecting", () =>
    disconnectController({
      userNamespace,
      instanceId: wsData.payload.instanceId,
      userId: wsData.payload.userId,
    })
  );

  //get instance data
  const oldInstanceData = await Instance.findById(wsData.payload.instanceId);
  if (!oldInstanceData) return;

  //delete old data of current user from the guests array
  const oldGuestData = oldInstanceData.guests.filter(
    (guest) => guest.userId !== wsData.payload.userId
  );
  //persist data to database
  await oldInstanceData?.updateOne({
    oldInstanceData,
    guests: [
      ...oldGuestData,
      {
        status: wsData.payload.status,
        userId: wsData.payload.userId,
      },
    ],
  });
}
*/
