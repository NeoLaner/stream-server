import { Namespace } from "socket.io";
import {
  GuestsData,
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
  guestsDataByRoomId: Record<string, GuestsData>;
};

function deleteUserFromGuests({
  guestsDataByRoomId,
  socket,
}: {
  guestsDataByRoomId: Record<string, GuestsData>;
  socket: UserSocket;
}) {
  const roomId = socket.data.instance._id.toString();
  guestsDataByRoomId[roomId] = guestsDataByRoomId[roomId]?.filter(
    (guest) => guest.userId !== socket.data.user.userId
  );
}

export function disconnectController({
  userNamespace,
  socket,
  guestsDataByRoomId,
}: DisconnectController) {
  const { userId } = socket.data.user;
  const instanceId = socket.data.instance._id.toString();
  const dcWsData: UserWsDataAfterMiddlewares = {
    payload: {
      userId: userId,
      status: "disconnected",
    },
  };
  deleteUserFromGuests({ guestsDataByRoomId, socket });
  userNamespace.to(instanceId).emit("user", dcWsData);
}
