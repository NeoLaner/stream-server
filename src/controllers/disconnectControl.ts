import { Namespace } from "socket.io";
import {
  UserSocket,
  UserWsDataAfterMiddlewares,
} from "../utils/@types/userTypes";

type DisconnectPreviousSockets = {
  namespace: Namespace;
  namespaceName: string;
  socket: UserSocket;
  userSocketMap: Map<string, string>;
  userRoomMap: Map<string, string>;
};

export function disconnectPreviousSockets({
  namespace,
  namespaceName,
  socket,
  userSocketMap,
  userRoomMap,
}: DisconnectPreviousSockets) {
  const { userId } = socket.data.user;
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
  socket: UserSocket;
};

export function disconnectController({
  userNamespace,
  socket,
}: DisconnectController) {
  const { userId } = socket.data.user;
  const instanceId = socket.data.instance._id.toString();
  const dcWsData: UserWsDataAfterMiddlewares = {
    payload: {
      userId: userId,
      status: "disconnected",
    },
  };
  userNamespace.to(instanceId).emit("user", dcWsData);
}
