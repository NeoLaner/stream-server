import { Socket } from "socket.io";
import decodeToken from "../../utils/factory/decodeToken";
import User from "../../apps/user/data-access/userModel";

import { JwtPayloadInstance } from "../../utils/@types";
import AppError from "../../utils/classes/appError";
import axios from "axios";

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

interface InstanceData {
  id: string;
  name: string;
  ownerId: string;
  roomId: string;
  online: boolean;
  timeWatched: number | null;
  season: number | null;
  episode: number | null;
  guests: any[]; // Replace `any` with the specific type if known
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
      console.log("auth");

      const cookies = socket.handshake.headers.cookie;
      console.log(cookies);
      // http://localhost:3000/api/trpc/instance.get?batch=1&input={"0": {"json": {"instanceId": "6666d8bfa561cbeafa014414" }}}

      const baseUrl = "http://localhost:3000/api/trpc/instance.get";
      const params = {
        batch: 1,
        input: JSON.stringify({
          "0": {
            json: {
              instanceId: "6666d8bfa561cbeafa014414",
            },
          },
        }),
      };

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

      const userUrl = "http://localhost:3000/api/trpc/user.me";

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
