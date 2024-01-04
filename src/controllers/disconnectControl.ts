import { Namespace } from "socket.io";
import { MediaSocketData } from "../utils/@types";
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

export function disconnectController({
  userNamespace,
  instanceId,
  userId,
}: DisconnectController) {
  const dcWsData: UserWsDataClientToServerEvents = {
    payload: {
      userId: userId,
      status: "disconnected",
    },
  };
  userNamespace.to(instanceId).emit("user", dcWsData);
}
