import { Namespace, Socket } from "socket.io";
import { MediaSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";

type MediaSocketControl = {
  mediaNamespace: Namespace;
  socket: Socket;
  wsData: MediaSocketData;
  userSocketMapByNamespace: Record<string, Map<string, string>>;
};

export function mediaSocketControl({
  mediaNamespace,
  socket,
  wsData,
  userSocketMapByNamespace,
}: MediaSocketControl) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];
  const curSocketId = userSocketMap.get(wsData.payload.userId);

  switch (wsData.eventType) {
    case EVENT_NAMES.KICK:
      if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
      break;
    default:
      socket.to(wsData.payload.instanceId).emit("media", wsData);
      break;
  }
}
