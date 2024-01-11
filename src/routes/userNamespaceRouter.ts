import { EVENT_NAMES } from "../utils/constants";
import {
  UserNamespace,
  UserSocket,
  UserSocketAfterMiddlewares,
} from "../utils/@types/userTypes";
import { authMiddleware } from "../controllers/authSocketControl";
import {
  addStatusToPayload,
  addUserIdToPayload,
  updateGuestsData,
  usersSocketControl,
} from "../controllers/usersSocketControl";

export function userNamespaceRouter(userNamespace: UserNamespace) {
  const {
    joinRoomHandler,
    initialDataHandler,
    readyHandler,
    unsyncHandler,
    waitingForDataHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  } = usersSocketControl(userNamespace);
  userNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  userNamespace.use(disconnectPreviousSocketsHandler);

  function socketRouter(socket: UserSocket) {
    const addUserIdToPayloadHandler = addUserIdToPayload.bind(socket);
    const addStatusToPayloadHandler = addStatusToPayload.bind(socket);
    const updateGuestsDataHandler = updateGuestsData.bind(socket);

    socket.use(addUserIdToPayloadHandler);
    socket.use(addStatusToPayloadHandler);

    const socketAfterMiddlewares = socket as UserSocketAfterMiddlewares;

    socketAfterMiddlewares.use(updateGuestsDataHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.UNSYNC, unsyncHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.USER_READY, readyHandler);
    socketAfterMiddlewares.on(
      EVENT_NAMES.USER_WAITING_FOR_DATA,
      waitingForDataHandler
    );
    socketAfterMiddlewares.on(EVENT_NAMES.INITIAL_DATA, initialDataHandler);
    socketAfterMiddlewares.on("disconnecting", disconnectHandler);
  }

  return { socketRouter };
}
