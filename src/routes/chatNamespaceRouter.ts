import { authMiddleware } from "../controllers/authSocketControl";
import { chatSocketControl } from "../controllers/chatSocketControl";
import {
  ChatNamespace,
  ChatSocket,
  ChatSocketAfterMiddlewares,
} from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";

export function chatNamespaceRouter(chatNamespace: ChatNamespace) {
  const { joinRoomHandler, disconnectPreviousSocketsHandler } =
    chatSocketControl(chatNamespace);
  chatNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  chatNamespace.use(disconnectPreviousSocketsHandler);

  function chatSocketRouter(socket: ChatSocket) {
    const socketAfterMiddlewares = socket as ChatSocketAfterMiddlewares;
    socketAfterMiddlewares.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    // socketAfterMiddlewares.on(EVENT_NAMES.CHAT_MSG_SUB );
  }
  return { chatSocketRouter };
}
