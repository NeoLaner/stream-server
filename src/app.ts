import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { EVENT_NAMES } from "./utils/constants";
import userRouter from "./routes/userRouter";
import AppError from "./utils/classes/appError";
import globalErrorControl from "./controllers/errorControl";
import videoRouter from "./routes/videoRouter";
import roomRouter from "./routes/roomRouter";
import instanceRouter from "./routes/instanceRouter";
import { disconnectPreviousSockets } from "./controllers/disconnectControl";
import { userNamespaceRouter } from "./routes/userNamespaceRouter";
import { authMiddleware } from "./controllers/authSocketControl";
import type { UserNamespace, UserSocket } from "./utils/@types/userTypes";
import { MediaNamespace, SocketData } from "./utils/@types";
import { MediaSocketData } from "./utils/@types/mediaTypes";

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

const userSocketMapByNamespace: Record<string, Map<string, string>> = {};
const userRoomMapByNamespace: Record<string, Map<string, string>> = {};

//User Namespace
const userNamespace: UserNamespace = ioServer.of("/user");
const { socketRouter } = userNamespaceRouter(userNamespace);

userNamespace.on("connection", (socket: UserSocket) => {
  socketRouter(socket);
});

//Media namespace

const mediaNamespace: MediaNamespace = ioServer.of("/media");

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
    const roomId = socket.data.instance._id.toString();

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

  socket.on("kick", (wsData) => {
    const curSocketId = userSocketMap.get(wsData.payload.userId);
    if (curSocketId) mediaNamespace.sockets.get(curSocketId)?.disconnect();
  });

  socket.on("media_played", (wsData) => {
    socket.to(wsData.payload.instanceId).emit("media", wsData);
  });
  socket.on("media_paused", (wsData) => {
    socket.to(wsData.payload.instanceId).emit("media", wsData);
  });
  socket.on("media_seeked", (wsData) => {
    socket.to(wsData.payload.instanceId).emit("media", wsData);
  });
});

ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

export default expressServer;
