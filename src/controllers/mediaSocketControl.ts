import { Namespace, Socket } from "socket.io";
import { MediaSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import { disconnectPreviousSockets } from "./disconnectControl";

type MediaSocketControl = {
  mediaNamespace: Namespace;
  socket: Socket;
  wsData: MediaSocketData;
  userRoomMapByNamespace: Record<string, Map<string, string>>;
};

export async function mediaSocketControl({
  mediaNamespace,
  socket,
  wsData,
  userRoomMapByNamespace,
}: MediaSocketControl) {
  const roomId = wsData.payload.instanceId as string;
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userRoomMapByNamespace[namespaceName];
  const curSocketId = userSocketMap.get(wsData.payload.userId);

  switch (wsData.eventType) {
    case EVENT_NAMES.JOIN_ROOM:
      disconnectPreviousSockets({
        namespace: mediaNamespace,
        namespaceName: "media",
        wsData,
        userSocketMap,
      });
      await socket.join(roomId);
      userSocketMap.set(wsData.payload.userId, socket.id);
      mediaNamespace.to(roomId).emit("media", wsData);
      break;
    case EVENT_NAMES.KICK:
      if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
      break;
    default:
      socket.to(wsData.payload.instanceId).emit("media", wsData);
      break;
  }
}
