import type { Document, Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { InstanceData, UserSocketData } from "../utils/@types";
import Instance from "../models/instanceModel";
import { EVENT_NAMES } from "../utils/constants";

type DisconnectController = {
  ioServer: Server;
  wsData: UserSocketData;
  oldInstanceData: Document<unknown, NonNullable<unknown>, InstanceData> &
    InstanceData &
    Required<{
      _id: Types.ObjectId;
    }>;
};

async function disconnectController({
  ioServer,
  wsData,
  oldInstanceData,
}: DisconnectController) {
  // console.log(`user ${wsData.payload.userId} disconnecting`, socket.rooms);

  const documentId = oldInstanceData._id; // Replace with the actual document ID
  const guestId = wsData.payload.userId; // Replace with the actual guest ID to delete
  /*

  await Instance.updateOne(
    { _id: documentId },
    { $pull: { guests: { userId: guestIdToDelete } } }
  ); //delete the guests by id
  */
  await Instance.updateOne(
    { _id: documentId, "guests.userId": guestId },
    {
      $set: {
        "guests.$.status": "disconnected", // Replace with the new status value
        // Add other fields to update as needed
      },
    }
  );

  const dcWsData: UserSocketData = {
    eventType: EVENT_NAMES.USER_DISCONNECTED,
    payload: {
      userId: wsData.payload.userId,
      status: "disconnected",
      instanceId: wsData.payload.instanceId,
    },
  };
  ioServer.to(wsData.payload.instanceId).emit("user", dcWsData);
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

  //join the room
  const roomId = wsData.payload.instanceId;
  await socket.join(roomId);
  console.log("user joined in this room:", roomId);
  console.log(`user ${wsData.payload.userId} joined`, socket.rooms);

  ioServer.to(roomId).emit("user", wsData);

  socket.on("disconnecting", () =>
    disconnectController({
      ioServer,
      oldInstanceData,
      wsData,
    })
  );
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
