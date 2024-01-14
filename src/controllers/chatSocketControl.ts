import { disconnectPreviousSockets } from "./disconnectControl";
import { ChatNamespace, ChatSocketAfterMiddlewares } from "../utils/@types";

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function chatSocketControl(chatNamespace: ChatNamespace) {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers
  async function joinRoomHandler(this: ChatSocketAfterMiddlewares) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.userId, socket.id);
    // console.log(guestsDataByRoomId);
  }

  // function kickHandler(
  //   this: ChatSocketAfterMiddlewares,
  //   wsData: MediaWsDataClientToServerAfterMiddlewares
  // ) {
  //   const { targetId } = wsData.payload;
  //   if (!targetId) return;
  //   const curSocketId = userSocketMap.get(targetId);
  //   if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  // }

  const disconnectPreviousSocketsHandler = (
    socket: ChatSocketAfterMiddlewares,
    next: (err?: Error) => void
  ) =>
    disconnectPreviousSockets({
      socket,
      namespace: chatNamespace,
      next,
      userSocketMap,
    });

  return {
    joinRoomHandler,
    disconnectPreviousSocketsHandler,
    // kickHandler,
  };
}
