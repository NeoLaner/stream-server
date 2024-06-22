import { authMiddleware } from "@/libraries/auth/authSocketControl";
import { MediaNamespace } from "@/utils/@types";
import { MediaSocket } from "@/utils/@types/mediaTypes";
import { mediaSocketControl } from "./mediaSocketControl";

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  const {
    updateUserMediaState,
    playHandler,
    pauseHandler,
    seekHandler,
    waitingForDataHandler,
    dataArrivedHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  } = mediaSocketControl(mediaNamespace);

  //run just for initial connection
  mediaNamespace.use(authMiddleware);
  //prevent user from connect to this namespace twice.
  mediaNamespace.use(disconnectPreviousSocketsHandler);

  function mediaSocketRouter(socket: MediaSocket) {
    //run for each packet
    // socket.on("joinRoom", joinRoomHandler);
    socket.on("updateUserMediaState", updateUserMediaState);
    socket.on("play", playHandler);
    socket.on("pause", pauseHandler);
    socket.on("seek", seekHandler);
    socket.on("waitingForData", waitingForDataHandler);
    socket.on("dataArrived", dataArrivedHandler);
    socket.on("disconnect", disconnectHandler);
    // socketAfterMiddlewares.on(EVENT_NAMES.KICK, kickHandler);
  }
  return mediaSocketRouter;
}
