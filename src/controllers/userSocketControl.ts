import { Namespace, Socket } from "socket.io";
import { UserSocketData } from "../utils/@types";
import Instance from "../models/instanceModel";
import { EVENT_NAMES } from "../utils/constants";
import {
  disconnectController,
  disconnectPreviousSockets,
} from "./disconnectControl";

/*
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};
async function joinRoomOnce({
  socketUser,
  namespace,
  userId,
  roomId,
}: {
  socketUser: Socket;
  namespace: string;
  userId: string;
  roomId: string;
}) {
  // Initialize the user-room map for the namespace if not exists
  if (!userRoomMapByNamespace[namespace]) {
    userRoomMapByNamespace[namespace] = new Map();
  }

  const userRoomMap = userRoomMapByNamespace[namespace];

  // Check if the user is already in a room in the namespace
  const currentRoom = userRoomMap.get(userId);

  if (currentRoom) {
    // User is already in a room, leave that room
    await socketUser.leave(currentRoom);
    console.log("user leave the room", { userId });
  }

  // Join the specified room
  await socketUser.join(roomId);

  // Update the user-room map
  userRoomMap.set(userId, roomId);
}
*/

type UserSocketControl = {
  userNamespace: Namespace;
  socket: Socket;
  wsData: UserSocketData;
};
export async function userSocketControl({
  userNamespace,
  socket,
  wsData,
}: UserSocketControl) {
  const roomId = wsData.payload.instanceId as string;
  switch (wsData.eventType) {
    case EVENT_NAMES.JOIN_ROOM:
      await disconnectPreviousSockets({
        namespace: userNamespace,
        namespaceName: "user",
        socket,
        wsData,
      });
      userNamespace.to(roomId).emit("user", wsData);
      break;
    default:
      userNamespace.to(roomId).emit("user", wsData);
      break;
  }

  socket.on("disconnecting", () =>
    disconnectController({
      userNamespace,
      instanceId: wsData.payload.instanceId,
      userId: wsData.payload.userId,
    })
  );
  /*
   */
  //get instance data
  const oldInstanceData = await Instance.findById(wsData.payload.instanceId);
  if (!oldInstanceData) return;

  //delete old data of current user from the guests array
  const oldGuestData = oldInstanceData.guests.filter(
    (guest) => guest.userId !== wsData.payload.userId
  );
  //persist data to database
  await oldInstanceData?.updateOne({
    oldInstanceData,
    guests: [
      ...oldGuestData,
      {
        status: wsData.payload.status,
        userId: wsData.payload.userId,
      },
    ],
  });
}

/*
type MediaSocketControl = {
  ioServer: Server;
  socketUser: Socket;
  wsData: MediaPausedSocket;
};

export async function mediaSocketControl({
  ioServer,
  socketUser,
  wsData,
}: UserSocketControl) {}
*/
