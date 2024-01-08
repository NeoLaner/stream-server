import { authMiddleware } from "../controllers/authSocketControl";
import { disconnectPreviousSockets } from "../controllers/disconnectControl";
import { MediaNamespace } from "../utils/@types";
import { MediaSocket, MediaSocketData } from "../utils/@types/mediaTypes";
import { EVENT_NAMES } from "../utils/constants";

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  mediaNamespace.use(authMiddleware);
  function mediaSocketRouter(socket: MediaSocket) {
    // Initialize the user-room map for the namespace if not exists
    const namespaceName = "media";
    if (!userSocketMapByNamespace[namespaceName]) {
      userSocketMapByNamespace[namespaceName] = new Map();
    }
    const userSocketMap = userSocketMapByNamespace[namespaceName];
    if (!userRoomMapByNamespace[namespaceName]) {
      userRoomMapByNamespace[namespaceName] = new Map();
    }
    const userRoomMap = userRoomMapByNamespace[namespaceName];

    socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData: MediaSocketData) => {
      const roomId = socket.data.instance._id.toString();

      disconnectPreviousSockets({
        namespace: mediaNamespace,
        namespaceName: "media",
        wsData,
        userSocketMap,
        userRoomMap,
      });
      await socket.join(roomId);
      userSocketMap.set(wsData.payload.userId, socket.id);
      mediaNamespace.to(roomId).emit("media", wsData);
    });

    socket.on("kick", (wsData) => {
      const curSocketId = userSocketMap.get(wsData.payload.userId);
      if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
    });

    socket.on("media_played", (wsData) => {
      socket.to(wsData.payload.instanceId).emit("media", wsData);
    });
    socket.on("media_paused", (wsData) => {
      socket.to(wsData.payload.instanceId).emit("media", wsData);
    });
    socket.on("media_seeked", (wsData) => {
      socket.to(wsData.payload.instanceId).emit("media", wsData);
    });
  }
  return { mediaSocketRouter };
}
