import { EVENT_NAMES } from "../utils/constants";
import { UserNamespace, UserSocket } from "../utils/@types/userTypes";
import { authMiddleware } from "../controllers/authSocketControl";
import {
  addUserIdToPayload,
  updateGuestsData,
  usersSocketControl,
} from "../controllers/usersSocketControl";

export function userNamespaceRouter(userNamespace: UserNamespace) {
  const {
    joinRoomHandler,
    disconnectHandler,
    initialDataHandler,
    readyHandler,
    unsyncHandler,
    waitingForDataHandler,
  } = usersSocketControl(userNamespace);

  userNamespace.use(authMiddleware);

  function socketRouter(socket: UserSocket) {
    socket.use(addUserIdToPayload.bind(socket));
    socket.on("disconnecting", disconnectHandler);
    socket.use(updateGuestsData.bind(socket));
    socket.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socket.on(EVENT_NAMES.UNSYNC, unsyncHandler);
    socket.on(EVENT_NAMES.USER_READY, readyHandler);
    socket.on(EVENT_NAMES.USER_WAITING_FOR_DATA, waitingForDataHandler);
    socket.on(EVENT_NAMES.USER_INITIAL_DATA, initialDataHandler);
  }

  return { socketRouter };
}
