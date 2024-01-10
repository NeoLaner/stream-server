import { Event } from "socket.io";
import {
  GuestsData,
  UserEvents,
  UserNamespace,
  UserSocket,
  UserStatus,
  UserWsDataAfterMiddlewares,
} from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";

const guestsDataByRoomId: Record<string, GuestsData> = {};
const userSocketMapByNamespace: Record<string, Map<string, string>> = {};

export function usersSocketControl(userNamespace: UserNamespace) {
  const namespaceName = "user";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];

  //Handlers
  async function joinRoomHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    await socket.join(roomId);
    userSocketMap.set(socket.data.user.userId, socket.id);

    userNamespace.to(roomId).emit("user", guestsDataByRoomId[roomId]);
    // console.log(guestsDataByRoomId);
  }

  function unsyncHandler(this: UserSocket, wsData: UserWsDataAfterMiddlewares) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    const isHost =
      socket.data.instance.hostId.toString() ===
      socket.data.user._id.toString();
    console.log(socket.data.instance.hostId, socket.data.user._id);

    const { targetId } = wsData.payload;
    if (!isHost || !targetId) return;
    const curSocketId = userSocketMap.get(targetId);
    guestsDataByRoomId[roomId] = guestsDataByRoomId[roomId].filter(
      (guest) => guest.userId !== targetId
    );
    userNamespace.to(roomId).emit("user", guestsDataByRoomId[roomId]);
    if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
    console.log(guestsDataByRoomId[roomId]);
  }

  function readyHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();

    userNamespace.to(roomId).emit("user", guestsDataByRoomId[roomId]);
  }

  function waitingForDataHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    userNamespace.to(roomId).emit("user", guestsDataByRoomId[roomId]);
  }

  function initialDataHandler(this: UserSocket) {
    const socket = this;
    const roomId = socket.data.instance._id.toString();
    socket.emit(EVENT_NAMES.INITIAL_DATA, guestsDataByRoomId[roomId]);
  }

  function disconnectHandler(this: UserSocket) {
    const socket = this;
    const { userId } = socket.data.user;
    const roomId = socket.data.instance._id.toString();
    guestsDataByRoomId[roomId] = guestsDataByRoomId[roomId]?.filter(
      (guest) => guest.userId !== socket.data.user.userId
    );
    userSocketMap.delete(userId);
    userNamespace.to(roomId).emit("user", guestsDataByRoomId[roomId]);
  }

  function disconnectPreviousSockets(
    this: UserSocket,
    event: Event,
    next: (err?: Error) => void
  ) {
    const eventName = event[0] as UserEvents;
    //one user can't join room twice
    if (eventName !== "join_room") return next();
    const socket = this;
    const { userId } = socket.data.user;
    const previousSocket = userSocketMap.get(userId);
    if (previousSocket) {
      //dc the previous socket of user if he had.
      console.log(
        "you join room before, previous one disconnect from user namespace"
      );
      userNamespace.sockets.get(previousSocket)?.disconnect();
    }
    next();
  }

  return {
    joinRoomHandler,
    unsyncHandler,
    readyHandler,
    waitingForDataHandler,
    initialDataHandler,
    disconnectHandler,
    disconnectPreviousSockets,
  };
}

//Middlewares
export function addUserIdToPayload(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  //The payload must have userId and status when emit to the client side.
  //but the client side send nothing
  const socket = this;

  //event[1] is wsData which come from client server
  if (!event[1]) event[1] = { payload: { userId: socket.data.user.userId } };
  const args = event[1] as UserWsDataAfterMiddlewares;

  args.payload = { ...args.payload, userId: socket.data.user.userId };

  next();
}

export function addStatusToPayload(
  this: UserSocket,
  event: Event,
  next: (err?: Error) => void
) {
  //The payload must have userId and status when emit to the client side.
  //but the client side send nothing
  const socket = this;

  //
  if (!event[1]) event[1] = { payload: { userId: socket.data.user.userId } };
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
      status = guestsDataByRoomId[socket.data.instance._id.toString()]?.filter(
        (guest) => guest.userId === socket.data.user.userId
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
    default:
      break;
  }
  // //for another events
  // const statusFromEvent = eventName.split("user_")[1] as UserStatus;
  // const previousStatus = guestsDataByRoomId[
  //   socket.data.instance._id.toString()
  // ]?.filter((guest) => guest.userId === socket.data.user.userId)[0]?.status;
  // // console.log(statusFromEvent);
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
  const roomId = socket.data.instance._id.toString();
  const wsData = event[1] as UserWsDataAfterMiddlewares;

  if (!guestsDataByRoomId[roomId]) guestsDataByRoomId[roomId] = [];
  const guestsData = guestsDataByRoomId[roomId];
  const foundIndex = guestsData.findIndex(
    (guest) => guest.userId === socket.data.user.userId
  );
  if (foundIndex !== -1)
    guestsData[foundIndex] = wsData.payload; // Update the data
  else guestsData[guestsData.length] = wsData.payload;

  next();
}
