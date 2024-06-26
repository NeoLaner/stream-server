import axios from "axios";
import { Socket } from "socket.io";

import { type RoomData } from "@/utils/@types";
import AppError from "../../utils/classes/appError";

interface AuthData {
  roomId: unknown;
  // other authentication properties
}

const roomsCapacity: Record<string, number> = {};

export function roomCapacityDec(roomId: string) {
  roomsCapacity[roomId] -= 1;
}

interface ResultData {
  data: {
    json: RoomData;
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
      // http://localhost:3000/api/trpc/room.get?batch=1&input={"0": {"json": {"roomId": "6666d8bfa561cbeafa014414" }}}
      const server =
        process.env.NODE_ENV === "development" ? "localhost:3000" : "scoap.ir";
      const baseUrl = `http://${server}/api/trpc/room.get`;
      const params = {
        batch: "1",
        input: JSON.stringify({
          "0": {
            json: {
              roomId: auth.roomId,
            },
          },
        }),
      };

      const encodedParams = new URLSearchParams(params).toString();
      const url = `${baseUrl}?${encodedParams}`;

      const { data: roomRes }: { data: ResponseData } = await axios.get(url, {
        headers: {
          Cookie: cookies,
        },
      });
      const roomData = roomRes[0].result.data.json;

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

      if (!userData || !roomRes) return next(new Error("No room"));

      socket.data = { user: userData, room: roomData };
      await socket.join(roomData.id);
      next();
    } catch (error) {
      // Pass any errors to next, and Socket.IO will handle them
      next(new AppError("Error ", 400));
    }
  })();
}
