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
    socket.on("kick", kickHandler);
    socket.on("media_played", playHandler);
    socket.on("media_paused", pauseHandler);
    socket.on("media_seeked", seekHandler);
  }
  return { mediaSocketRouter };
}
