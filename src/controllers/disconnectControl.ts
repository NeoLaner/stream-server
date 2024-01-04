import { Namespace } from "socket.io";
import { MediaSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import Instance from "../models/instanceModel";
import { UserWsDataClientToServerEvents } from "../utils/@types/userTypes";

type DisconnectPreviousSockets = {
  namespace: Namespace;
  namespaceName: string;
  wsData: UserWsDataClientToServerEvents | MediaSocketData;
  userSocketMap: Map<string, string>;
  userRoomMap: Map<string, string>;
};

export function disconnectPreviousSockets({
  namespace,
  namespaceName,
  wsData,
  userSocketMap,
  userRoomMap,
}: DisconnectPreviousSockets) {
  const { userId } = wsData.payload;
  const currentSocket = userSocketMap.get(userId);
  if (currentSocket) {
    //dc the previous socket of user if he had.
    console.log("disconnect worked sucka  bliat from", namespaceName);
    namespace.sockets.get(currentSocket)?.disconnect();
    userRoomMap.delete(userId);
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

  const dcWsData: UserWsDataClientToServerEvents = {
    payload: {
      userId: userId,
      status: "disconnected",
    },
  };
  userNamespace.to(instanceId).emit(EVENT_NAMES.USER_DISCONNECTED, dcWsData);
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
