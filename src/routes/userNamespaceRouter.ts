import { Event } from "socket.io";
import { EVENT_NAMES } from "../utils/constants";
import {
  UserClientToServerEventsWithoutUserId,
  UserNamespace,
  UserSocket,
} from "../utils/@types/userTypes";
import { authMiddleware } from "../controllers/authSocketControl";
import {
  updateGuestsData,
  usersSocketControl,
} from "../controllers/usersSocketControl";

function addUserIdToPayload(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  //The payload must have userId when emit to the client side.
  //but the client side should not send the user id in the payload.
  const socket = this;

  //event[1] is wsData which come from client server
  if (!event[1]) event[1] = { payload: { userId: socket.data.user.userId } };
  const args = event[1] as UserClientToServerEventsWithoutUserId & {
    payload: { userId: string | undefined };
  };

  args.payload = { ...args.payload, userId: socket.data.user.userId };

  next();
}

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
