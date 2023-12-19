import { Namespace, Socket } from "socket.io";
import { MediaSocketData } from "../utils/@types";
import { EVENT_NAMES } from "../utils/constants";
import { disconnectPreviousSockets } from "./disconnectControl";

type MediaSocketControl = {
  mediaNamespace: Namespace;
  socket: Socket;
  wsData: MediaSocketData;
};

export async function mediaSocketControl({
  mediaNamespace,
  socket,
  wsData,
}: MediaSocketControl) {
  switch (wsData.eventType) {
    case EVENT_NAMES.JOIN_ROOM:
      await disconnectPreviousSockets({
        namespace: mediaNamespace,
        namespaceName: "media",
        socket,
        wsData,
      });
      break;
    default:
      mediaNamespace.to(wsData.payload.instanceId).emit("media", wsData);
      break;
  }
}
