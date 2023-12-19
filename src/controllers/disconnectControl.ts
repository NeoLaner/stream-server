import { Namespace } from "socket.io";
import { UserSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import Instance from "../models/instanceModel";

type DisconnectController = {
  userNamespace: Namespace;
  instanceId: string | string[];
  userId: string;
};

export async function disconnectController({
  userNamespace,
  instanceId,
  userId,
}: DisconnectController) {
  // console.log(`user ${wsData.payload.userId} disconnecting`, socketUser.rooms);

  const documentId = instanceId; // Replace with the actual document ID
  const guestId = userId; // Replace with the actual guest ID to delete
  /*

  await Instance.updateOne(
    { _id: documentId },
    { $pull: { guests: { userId: guestIdToDelete } } }
  ); //delete the guests by id
  */

  const dcWsData: UserSocketData = {
    eventType: EVENT_NAMES.USER_DISCONNECTED,
    payload: {
      userId: userId,
      status: "disconnected",
      instanceId: instanceId,
    },
  };
  userNamespace.to(instanceId).emit("user", dcWsData);
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
