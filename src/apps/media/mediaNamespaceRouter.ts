import { authMiddleware } from "@/libraries/auth/authSocketControl";
import { MediaNamespace } from "@/utils/@types";
import { MediaSocket } from "@/utils/@types/mediaTypes";
import { mediaSocketControl } from "./mediaSocketControl";

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  const {
    updateUserMediaState,
    updateRoomDataHandler,
    updateSourceDataHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    waitingForDataHandler,
    dataArrivedHandler,
    userMessageHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  } = mediaSocketControl(mediaNamespace);

  //run just for initial connection
  mediaNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  mediaNamespace.use(disconnectPreviousSocketsHandler);

  function mediaSocketRouter(socket: MediaSocket) {
    socket.on("updateUserMediaState", updateUserMediaState);
    socket.on("roomDataChanged", updateRoomDataHandler);
    socket.on("sourceDataChanged", updateSourceDataHandler);
    socket.on("play", playHandler);
    socket.on("pause", pauseHandler);
    socket.on("seek", seekHandler);
    socket.on("waitingForData", waitingForDataHandler);
    socket.on("dataArrived", dataArrivedHandler);
    socket.on("chat:userMessaged", userMessageHandler);
    socket.on("disconnect", disconnectHandler);
    // socketAfterMiddlewares.on(EVENT_NAMES.KICK, kickHandler);
  }
  return mediaSocketRouter;
}
