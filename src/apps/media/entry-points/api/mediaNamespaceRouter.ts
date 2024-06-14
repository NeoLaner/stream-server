import { authMiddleware } from "@/libraries/auth/authSocketControl";
import { MediaNamespace } from "@/utils/@types";
import {
  MediaSocket,
  MediaSocketAfterMiddlewares,
} from "@/utils/@types/mediaTypes";
import { EVENT_NAMES } from "@/utils/constants";
import { mediaSocketControl } from "../../domain/mediaSocketControl";

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  const {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    addStatusToPayload,
    waitingForDataHandler,
    receivedDataHandler,
    disconnectHandler,
    disconnectPreviousSocketsHandler,
  } = mediaSocketControl(mediaNamespace);

  mediaNamespace.use(authMiddleware);

  //prevent user from connect to this namespace twice.
  mediaNamespace.use(disconnectPreviousSocketsHandler);

  function mediaSocketRouter(socket: MediaSocket) {
    const addStatusToPayloadHandler = addStatusToPayload.bind(socket);
    socket.use(addStatusToPayloadHandler);

    const socketAfterMiddlewares = socket as MediaSocketAfterMiddlewares;
    socketAfterMiddlewares.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.KICK, kickHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.MEDIA_PLAYED, playHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.MEDIA_PAUSED, pauseHandler);
    socketAfterMiddlewares.on(EVENT_NAMES.MEDIA_SEEKED, seekHandler);
    socketAfterMiddlewares.on(
      EVENT_NAMES.MEDIA_WAITING_FOR_DATA,
      waitingForDataHandler
    );
    socketAfterMiddlewares.on(
      EVENT_NAMES.MEDIA_RECEIVED_DATA,
      receivedDataHandler
    );
    socketAfterMiddlewares.on("disconnect", disconnectHandler);
  }
  return { mediaSocketRouter };
}
