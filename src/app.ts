import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { Namespace, Server, Socket } from "socket.io";
import {
  JwtPayloadInstance,
  MediaEvents,
  MediaSocketData,
  SocketData,
} from "./utils/@types";
import { EVENT_NAMES } from "./utils/constants";
import userRouter from "./routes/userRouter";
import AppError from "./utils/classes/appError";
import globalErrorControl from "./controllers/errorControl";
import videoRouter from "./routes/videoRouter";
import roomRouter from "./routes/roomRouter";
import instanceRouter from "./routes/instanceRouter";
import { mediaSocketControl } from "./controllers/mediaSocketControl";
import { disconnectPreviousSockets } from "./controllers/disconnectControl";
import { socketControl } from "./controllers/userSocketControl";
import decodeToken from "./utils/factory/decodeToken";
import User from "./models/userModel";
import Instance from "./models/instanceModel";
import {
  UserClientToServerEventsWithoutUserId,
  UserServerToClientEvents,
} from "./utils/@types/userTypes";

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // console.log(req.ip);
  next();
});

app.use(
  cors({
    //NOTE: allows cross-origin requests to include credentials
    //(such as cookies, HTTP authentication, and client-side SSL certificates).
    credentials: true,
    //NOTE: origin: true (or origin: '*') allows requests from any origin (domain).
    //This essentially opens up your server to cross-origin requests from any site.
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_CLIENT_SERVER
        : process.env.CLIENT_SERVER,
  })
);

app.get("/test", (req, res) => {
  res.json({
    status: "success",
    data: {
      message: "Everything is fine",
    },
  });
});

app.use("/api/v1/video", videoRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/instance", instanceRouter);

app.all("*", (req, res, next) => {
  return next(new AppError(`Can't find  ${req.originalUrl}`, 404));
});

app.use(globalErrorControl);

const expressServer = http.createServer(app);

interface AuthData {
  instanceJwt: unknown;
  // other authentication properties
}

type ClientToServerEvents = object;
type ServerToClintEvents = object;
type NamespaceSpecificInterServerEvents = object;

//Socket.io
const ioServer = new Server<
  ClientToServerEvents,
  ServerToClintEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
>(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_CLIENT_SERVER
        : process.env.CLIENT_SERVER,
  },
});

function authMiddleware(socket: Socket, next: (err?: Error) => void) {
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

      socket.data = { user, instance };

      next();
    } catch (error) {
      // Pass any errors to next, and Socket.IO will handle them
      next(new AppError("Error ", 400));
    }
  })();
}

//User Namespace

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};

const userNamespace: Namespace<
  UserClientToServerEventsWithoutUserId,
  UserServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  SocketData
> = ioServer.of("/user");
userNamespace.use(authMiddleware);

userNamespace.on("connection", (socket) => {
  socket.use((event, next) => {
    //The payload must have userId when emit to the client side.
    //but the client side should not send the user id in the payload.
    if (!event[1]) return next();
    const args = event[1] as UserClientToServerEventsWithoutUserId & {
      payload: { userId: string | undefined };
    };

    args.payload = { ...args.payload, userId: socket.data.user.userId };

    next();
  });
  socketControl({
    socket,
    userNamespace,
    userRoomMapByNamespace,
    userSocketMapByNamespace,
  });
});

type MediaClientToServerEvents = Record<
  MediaEvents | "media",
  (wsData: MediaSocketData) => void
>;

type MediaServerToClientEvents = Record<
  "media",
  (wsData: MediaSocketData) => void
>;

const mediaNamespace: Namespace<
  MediaClientToServerEvents,
  MediaServerToClientEvents
> = ioServer.of("/media");
mediaNamespace.use(authMiddleware);

mediaNamespace.on("connection", (socket) => {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userSocketMapByNamespace[namespaceName]) {
    userSocketMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userSocketMapByNamespace[namespaceName];
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userRoomMap = userRoomMapByNamespace[namespaceName];

  socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData: MediaSocketData) => {
    const roomId = wsData.payload.instanceId as string;

    disconnectPreviousSockets({
      namespace: mediaNamespace,
      namespaceName: "media",
      wsData,
      userSocketMap,
      userRoomMap,
    });
    await socket.join(roomId);
    userSocketMap.set(wsData.payload.userId, socket.id);
    mediaNamespace.to(roomId).emit("media", wsData);
  });
  socket.on("media", (wsData: MediaSocketData) =>
    mediaSocketControl({
      mediaNamespace,
      socket,
      wsData,
      userSocketMapByNamespace,
    })
  );
});

ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

export default expressServer;
