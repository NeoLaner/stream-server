import axios from "axios";
import { Socket } from "socket.io";

import AppError from "../../utils/classes/appError";

interface AuthData {
  instanceId: unknown;
  // other authentication properties
}

const roomsCapacity: Record<string, number> = {};

export function roomCapacityDec(roomId: string) {
  roomsCapacity[roomId] -= 1;
}

interface InstanceData {
  id: string;
  name: string;
  ownerId: string;
  roomId: string;
  online: boolean;
  timeWatched: number | null;
  season: number | null;
  episode: number | null;
  guests: string[]; // Replace `any` with the specific type if known
}

interface ResultData {
  data: {
    json: InstanceData;
  };
}

interface ResponseData {
  [key: string]: {
    result: ResultData;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image: string;
  addons: string[];
}

interface UserResultData {
  data: {
    json: UserData;
  };
}

interface UserResponseData {
  result: UserResultData;
}

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  void (async () => {
    // Immediately-invoked async arrow function
    try {
      const auth = socket.handshake.auth as AuthData;
      console.log("auth", auth);

      const cookies = socket.handshake.headers.cookie;
      console.log(cookies);
      // http://localhost:3000/api/trpc/instance.get?batch=1&input={"0": {"json": {"instanceId": "6666d8bfa561cbeafa014414" }}}
      const server =
        process.env.NODE_ENV === "development" ? "localhost:3000" : "scoap.ir";
      const baseUrl = `http://${server}/api/trpc/instance.get`;
      const params = {
        batch: 1,
        input: JSON.stringify({
          "0": {
            json: {
              instanceId: auth.instanceId,
            },
          },
        }),
      };

      //@ts-ignore
      const encodedParams = new URLSearchParams(params).toString();
      const url = `${baseUrl}?${encodedParams}`;

      const { data: instanceRes }: { data: ResponseData } = await axios.get(
        url,
        {
          headers: {
            Cookie: cookies,
          },
        }
      );
      const instanceData = instanceRes[0].result.data.json;

      const userUrl = `http://${server}/api/trpc/user.me`;

      const { data: userRes }: { data: UserResponseData } = await axios.get(
        userUrl,
        {
          headers: {
            Cookie: cookies,
          },
        }
      );
      const userData = userRes.result.data.json;
      console.log(userData);

      if (!userData || !instanceRes)
        return next(new Error("No instanceJwt provided."));

      socket.data = { user: userData, instance: instanceData };

      next();
    } catch (error) {
      // Pass any errors to next, and Socket.IO will handle them
      next(new AppError("Error ", 400));
    }
  })();
}
