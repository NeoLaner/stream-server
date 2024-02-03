import { Namespace } from "socket.io";
import {
  UserSocket,
  UserWsDataAfterMiddlewares,
} from "../utils/@types/userTypes";

type DisconnectPreviousSockets = {
  namespace: Namespace;
  socket: UserSocket;
  userSocketMap: Map<string, string>;
  next: (err?: Error) => void;
};

export function disconnectPreviousSockets({
  namespace,
  socket,
  userSocketMap,
  next,
}: DisconnectPreviousSockets) {
  const { userId } = socket.data.user;
  const previousSocket = userSocketMap.get(userId);

  if (previousSocket === socket.id) return next();
  if (previousSocket) {
    //dc the previous socket of user if he had.
    console.log(
      "you connect this namespace before, previous one disconnect from this namespace"
    );
    namespace.sockets.get(previousSocket)?.disconnect();
  }
  next();
}

type DisconnectController = {
  userNamespace: Namespace;
  socket: UserSocket;
};

export function disconnectController({
  userNamespace,
  socket,
}: DisconnectController) {
  const { userId, name } = socket.data.user;
  const instanceId = socket.data.instance._id.toString();
  const dcWsData: UserWsDataAfterMiddlewares = {
    payload: {
      userId: userId,
      userName: name,
      status: "disconnected",
    },
  };
  userNamespace.to(instanceId).emit("user", dcWsData);
}
