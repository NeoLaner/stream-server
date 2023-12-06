import type { Document, Types } from "mongoose";
import { Socket } from "socket.io";
import { InstanceData, UserSocketData } from "../utils/@types";
import Instance from "../models/instanceModel";
import { EVENT_NAMES } from "../utils/constants";

type DisconnectController = {
  socket: Socket;
  wsData: UserSocketData;
  oldInstanceData: Document<unknown, NonNullable<unknown>, InstanceData> &
    InstanceData &
    Required<{
      _id: Types.ObjectId;
    }>;
  roomId: string | string[];
};

export async function disconnectController({
  socket,
  wsData,
  oldInstanceData,
  roomId,
}: DisconnectController) {
  console.log(`user ${wsData.payload.userId} disconnecting`, socket.rooms);

  const documentId = oldInstanceData._id; // Replace with the actual document ID
  const guestId = wsData.payload.userId; // Replace with the actual guest ID to delete
  /*

  await Instance.updateOne(
    { _id: documentId },
    { $pull: { guests: { userId: guestIdToDelete } } }
  ); //delete the guests by id
  */
  const newData = await Instance.updateOne(
    { _id: documentId, "guests.userId": guestId },
    {
      $set: {
        "guests.$.status": "disconnected", // Replace with the new status value
        // Add other fields to update as needed
      },
    }
  );
  console.log(newData);

  socket.to(roomId).emit("user", {
    eventType: EVENT_NAMES.USER_DISCONNECTED,
    payload: {
      userId: wsData.payload.userId,
      status: "disconnected",
    },
  });
}
