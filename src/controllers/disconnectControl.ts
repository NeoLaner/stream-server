import { Namespace } from "socket.io";
import { MediaSocketData, UserSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import Instance from "../models/instanceModel";

type DisconnectPreviousSockets = {
  namespace: Namespace;
  namespaceName: string;
  wsData: UserSocketData | MediaSocketData;
  userSocketMap: Map<string, string>;
};

export function disconnectPreviousSockets({
  namespace,
  namespaceName,
  wsData,
  userSocketMap,
}: DisconnectPreviousSockets) {
  const { userId } = wsData.payload;
  const currentRoom = userSocketMap.get(userId);
  if (currentRoom) {
    //dc the previous socket of user if he had.
    console.log("disconnect worked sucka bliat from", namespaceName);
    namespace.sockets.get(currentRoom)?.disconnect();
  }
}

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
  const documentId = instanceId; // Replace with the actual document ID
  const guestId = userId; // Replace with the actual guest ID to delete

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
