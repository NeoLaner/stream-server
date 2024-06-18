import { Event } from "socket.io";
import {
  UserEvents,
  UserNamespace,
  UserSocket,
  UserStatus,
  UserWsDataAfterMiddlewares,
} from "@/utils/@types";
import { EVENT_NAMES } from "@/utils/constants";
import { disconnectPreviousSockets } from "@/libraries/dc/disconnectControl";
import { roomCapacityDec } from "@/libraries/auth/authSocketControl";
import { getGuestsOfRoomData, guestsCache } from "@/utils/factory/cache";

const expirySeconds = 3600; // 1 hour
const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function usersSocketControl(userNamespace: UserNamespace) {
  if (!userSocketMapByNamespace.user) {
    userSocketMapByNamespace.user = new Map();
  }
  const userSocketMap = userSocketMapByNamespace.user;

  //Handlers
  async function joinRoomHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.id, socket.id);

    userNamespace.to(roomId).emit("user", getGuestsOfRoomData(roomId));
  }

  function readyHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();

    userNamespace.to(roomId).emit("user", getGuestsOfRoomData(roomId));
  }

  function waitingForDataHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    userNamespace.to(roomId).emit("user", getGuestsOfRoomData(roomId));
  }

  function initialDataHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    socket.emit(EVENT_NAMES.INITIAL_DATA, getGuestsOfRoomData(roomId));
  }

  function changeSourceHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance.id.toString();
    userNamespace.to(roomId).emit("user", getGuestsOfRoomData(roomId));
  }

  function disconnectHandler(this: UserSocket) {
    const socket = this;
    const { id } = socket.data.user;
    const roomId = socket.data.instance.id.toString();
    guestsCache.set(
      roomId,
      getGuestsOfRoomData(roomId)?.filter(
        (guest) => guest.userId !== socket.data.user.id
      ),
      expirySeconds
    );
    userSocketMap.delete(id);
    roomCapacityDec(roomId);
    userNamespace.to(roomId).emit("user", getGuestsOfRoomData(roomId));
  }

  const disconnectPreviousSocketsHandler = (
    socket: UserSocket,
    next: (err?: Error) => void
  ) => {
    return disconnectPreviousSockets({
      socket,
      namespace: userNamespace,
      next,
      userSocketMap,
    });
  };

  return {
    joinRoomHandler,
    readyHandler,
    waitingForDataHandler,
    initialDataHandler,
    changeSourceHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  };
}

//Middlewares
export function addUserDetailsToPayload(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  //The payload must have id and status when emit to the client side.
  //but the client side send nothing
  const socket = this;

  //event[1] is wsData which come from client server
  if (!event[1]) event[1] = { payload: { id: socket.data.user.id } };
  const args = event[1] as UserWsDataAfterMiddlewares;

  args.payload = {
    ...args.payload,
    userId: socket.data.user.id,
    userName: socket.data.user.name,
    image: socket.data.user.image,
  };

  next();
}

export function addStatusToPayload(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  //The payload must have id and status when emit to the client side.
  //but the client side send nothing
  const socket = this;

  //
  if (!event[1]) event[1] = { payload: { id: socket.data.user.id } };
  const args = event[1] as UserWsDataAfterMiddlewares;
  const eventName = event[0] as UserEvents;

  //for joinRoom
  let status: UserStatus = "notReady";

  switch (eventName) {
    case "initial_data":
      status = "notReady";
      break;
    case "join_room":
      status = "notReady";
      break;
    case "kick":
      break;
    case "unsync":
      status = getGuestsOfRoomData(socket.data.instance.id.toString())?.filter(
        (guest) => guest.userId === socket.data.user.id
      )[0]?.status;
      break;
    case "user_disconnected":
      status = "disconnected";
      break;
    case "user_notReady":
      status = "notReady";
      break;
    case "user_ready":
      status = "ready";
      break;
    case "user_waitingForData":
      status = "waitingForData";
      break;
    case "user_changeSource":
      status = "notReady";
      break;
    default:
      break;
  }
  // //for another events
  // const statusFromEvent = eventName.split("user_")[1] as UserStatus;
  // const previousStatus = guestsDataByRoomId[
  //   socket.data.instance.id.toString()
  // ]?.filter((guest) => guest.id === socket.data.user.id)[0]?.status;
  // if (statusFromEvent) status = statusFromEvent;
  // if (!statusFromEvent && previousStatus) status = previousStatus;

  //assign the status
  args.payload = { ...args.payload, status };

  next();
}

export function updateGuestsData(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  const socket = this;
  const roomId = socket.data.instance.id.toString();
  const wsData = event[1] as UserWsDataAfterMiddlewares;

  const guestsData = getGuestsOfRoomData(roomId);
  const foundIndex = guestsData.findIndex(
    (guest) => guest.userId === socket.data.user.id
  );
  if (foundIndex !== -1)
    guestsData[foundIndex] = wsData.payload; // Update the data
  else guestsData[guestsData.length] = wsData.payload;

  next();
}
