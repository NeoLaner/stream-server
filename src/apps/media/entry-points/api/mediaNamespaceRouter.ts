import { authMiddleware } from "../../../../libraries/auth/authSocketControl";
import { mediaSocketControl } from "../../domain/mediaSocketControl";
import { MediaNamespace } from "../../../../utils/@types";
import {
  MediaSocket,
  MediaSocketAfterMiddlewares,
} from "../../../../utils/@types/mediaTypes";
import { EVENT_NAMES } from "../../../../utils/constants";

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  const {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
    addStatusToPayload,
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
    socketAfterMiddlewares.on("disconnect", disconnectHandler);
  }
  return { mediaSocketRouter };
}
