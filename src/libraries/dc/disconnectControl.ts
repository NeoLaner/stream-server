import { Namespace } from "socket.io";
import {
  UserSocket,
  UserWsDataAfterMiddlewares,
} from "../../utils/@types/userTypes";

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
  const { id } = socket.data.user;
  const previousSocket = userSocketMap.get(id);

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
  const { id, name } = socket.data.user;
  const roomId = socket.data.room.id.toString();
  const dcWsData: UserWsDataAfterMiddlewares = {
    payload: {
      userId: id,
      userName: name,
      status: "disconnected",
    },
  };
  userNamespace.to(roomId).emit("user", dcWsData);
}
