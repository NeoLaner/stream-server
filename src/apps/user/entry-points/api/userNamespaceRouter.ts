import { EVENT_NAMES } from "@/utils/constants";
import {
  UserNamespace,
  UserSocket,
  UserSocketAfterMiddlewares,
} from "@/utils/@types/userTypes";
import { authMiddleware } from "@/libraries/auth/authSocketControl";
import {
  addStatusToPayload,
  addUserDetailsToPayload,
  updateGuestsData,
  usersSocketControl,
} from "../../domain/usersSocketControl";

export function userNamespaceRouter(userNamespace: UserNamespace) {
  const {
    joinRoomHandler,
    initialDataHandler,
    readyHandler,
    waitingForDataHandler,
    changeSourceHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  } = usersSocketControl(userNamespace);
  userNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  userNamespace.use(disconnectPreviousSocketsHandler);

  function socketRouter(socket: UserSocket) {
    const addUserIdToPayloadHandler = addUserDetailsToPayload.bind(socket);
    const addStatusToPayloadHandler = addStatusToPayload.bind(socket);
    const updateGuestsDataHandler = updateGuestsData.bind(socket);

    socket.use(addUserIdToPayloadHandler);
    socket.use(addStatusToPayloadHandler);

    const socketAfterMiddlewares = socket as UserSocketAfterMiddlewares;

    socketAfterMiddlewares.use(updateGuestsDataHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.USER_READY, readyHandler);
    socketAfterMiddlewares.on(
      EVENT_NAMES.USER_WAITING_FOR_DATA,
      waitingForDataHandler
    );
    socketAfterMiddlewares.on(
      EVENT_NAMES.USER_CHANGE_SOURCE,
      changeSourceHandler
    );
    socketAfterMiddlewares.on(EVENT_NAMES.INITIAL_DATA, initialDataHandler);
    socketAfterMiddlewares.on("disconnecting", disconnectHandler);
  }

  return { socketRouter };
}
