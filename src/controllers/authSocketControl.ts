import { Socket } from "socket.io";
import decodeToken from "../utils/factory/decodeToken";
import User from "../models/userModel";
import Instance from "../models/instanceModel";
import { JwtPayloadInstance } from "../utils/@types";
import AppError from "../utils/classes/appError";

interface AuthData {
  instanceJwt: unknown;
  // other authentication properties
}

const roomsCapacity: Record<string, number> = {};

function roomCapacityInc(roomId: string) {
  if (!roomsCapacity[roomId]) roomsCapacity[roomId] = 0;
  roomsCapacity[roomId] += 1;
}

export function roomCapacityDec(roomId: string) {
  roomsCapacity[roomId] -= 1;
}

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  void (async () => {
    // Immediately-invoked async arrow function
    try {
      const auth = socket.handshake.auth as AuthData;

      if (typeof auth.instanceJwt !== "string") {
        // Emit an error with next if there's no instanceJwt
        return next(new Error("No instanceJwt provided."));
      }
      const decoded = await decodeToken<
        Record<
          Extract<keyof JwtPayloadInstance, "instance">,
          JwtPayloadInstance["instance"]
        >
      >(auth.instanceJwt);

      const user = await User.findById(decoded.instance.user_id);
      const instance = await Instance.findById(decoded.instance.instanceId);

      if (!user || !instance)
        return next(new AppError("No user or instance found.", 400));

      const roomId = instance._id.toString();

      //4 users * 3 namespace = 12
      if (roomsCapacity[roomId] > 4 * 3) {
        return socket.disconnect();
      }
      roomCapacityInc(roomId);
      socket.data = { user, instance };

      next();
    } catch (error) {
      // Pass any errors to next, and Socket.IO will handle them
      next(new AppError("Error ", 400));
    }
  })();
}
