import { authMiddleware } from "../controllers/authSocketControl";
import { mediaSocketControl } from "../controllers/mediaSocketControl";
import { MediaNamespace } from "../utils/@types";
import { MediaSocket } from "../utils/@types/mediaTypes";
import { EVENT_NAMES } from "../utils/constants";

export function mediaNamespaceRouter(mediaNamespace: MediaNamespace) {
  const {
    joinRoomHandler,
    kickHandler,
    playHandler,
    pauseHandler,
    seekHandler,
  } = mediaSocketControl(mediaNamespace);
  mediaNamespace.use(authMiddleware);
  function mediaSocketRouter(socket: MediaSocket) {
    socket.on(EVENT_NAMES.JOIN_ROOM, joinRoomHandler);
    socket.on(EVENT_NAMES.KICK, kickHandler);
    socket.on(EVENT_NAMES.MEDIA_PLAYED, playHandler);
    socket.on(EVENT_NAMES.MEDIA_PAUSED, pauseHandler);
    socket.on(EVENT_NAMES.MEDIA_SEEKED, seekHandler);
  }
  return { mediaSocketRouter };
}