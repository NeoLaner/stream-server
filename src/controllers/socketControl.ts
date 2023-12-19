import { Server, Socket } from "socket.io";
import { UserSocketData } from "../utils/@types";
import Instance from "../models/instanceModel";
import { EVENT_NAMES } from "../utils/constants";

const userSocketMap = new Map<string, string>();
/*
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};
async function joinRoomOnce({
  socket,
  namespace,
  userId,
  roomId,
}: {
  socket: Socket;
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
    await socket.leave(currentRoom);
    console.log("user leave the room", { userId });
  }

  // Join the specified room
  await socket.join(roomId);

  // Update the user-room map
  userRoomMap.set(userId, roomId);
}
*/
type DisconnectController = {
  ioServer: Server;
  wsData: UserSocketData;
};

async function disconnectController({
  ioServer,
  wsData,
}: DisconnectController) {
  // console.log(`user ${wsData.payload.userId} disconnecting`, socket.rooms);

  const documentId = wsData.payload.instanceId; // Replace with the actual document ID
  const guestId = wsData.payload.userId; // Replace with the actual guest ID to delete
  /*

  await Instance.updateOne(
    { _id: documentId },
    { $pull: { guests: { userId: guestIdToDelete } } }
  ); //delete the guests by id
  */

  const dcWsData: UserSocketData = {
    eventType: EVENT_NAMES.USER_DISCONNECTED,
    payload: {
      userId: wsData.payload.userId,
      status: "disconnected",
      instanceId: wsData.payload.instanceId,
    },
  };
  ioServer.to(wsData.payload.instanceId).emit("user", dcWsData);
  await Instance.updateOne(
    { _id: documentId, "guests.userId": guestId },
    {
      $set: {
        "guests.$.status": "disconnected", // Replace with the new status value
        // Add other fields to update as needed
      },
    }
  );
}

type UserSocketControl = {
  ioServer: Server;
  socket: Socket;
  wsData: UserSocketData;
};
export async function userSocketControl({
  ioServer,
  socket,
  wsData,
}: UserSocketControl) {
  if (wsData.eventType === EVENT_NAMES.USER_SET_ID) {
    const { userId } = wsData.payload;
    const currentRoom = userSocketMap.get(userId);
    if (currentRoom) {
      //dc the previous socket of user if he had.
      console.log("disconnect worked sucka bliat");
      ioServer.sockets.sockets.get(currentRoom)?.disconnect();
    }
    userSocketMap.set(userId, socket.id);
  }
  //join the room
  const roomId = wsData.payload.instanceId as string;
  await socket.join(roomId);

  ioServer.to(roomId).emit("user", wsData);

  socket.on("disconnecting", () =>
    disconnectController({
      ioServer,
      wsData,
    })
  );
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
  socket: Socket;
  wsData: MediaPausedSocket;
};

export async function mediaSocketControl({
  ioServer,
  socket,
  wsData,
}: UserSocketControl) {}
*/
