import { authMiddleware } from "../../../../libraries/auth/authSocketControl";
import { chatSocketControl } from "../../domain/chatSocketControl";
import {
  ChatNamespace,
  ChatSocket,
  ChatSocketAfterMiddlewares,
} from "../../../../utils/@types";
import { EVENT_NAMES } from "../../../../utils/constants";

export function chatNamespaceRouter(chatNamespace: ChatNamespace) {
  const {
    addUserDetails,
    joinRoomHandler,
    disconnectPreviousSocketsHandler,
    disconnectHandler,
    msgSubHandler,
  } = chatSocketControl(chatNamespace);
  chatNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  chatNamespace.use(disconnectPreviousSocketsHandler);

  function chatSocketRouter(socket: ChatSocket) {
    const addUserDetailsHandler = addUserDetails.bind(socket);
    socket.use(addUserDetailsHandler);

    const socketAfterMiddlewares = socket as ChatSocketAfterMiddlewares;
    socketAfterMiddlewares.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.CHAT_MSG_SUB, msgSubHandler);
    socketAfterMiddlewares.on("disconnect", disconnectHandler);
  }
  return { chatSocketRouter, msgSubHandler };
}
