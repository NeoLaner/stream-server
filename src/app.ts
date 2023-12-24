import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import {
  MediaSocketData,
  MessageDataApi,
  UserSocketData,
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

//Socket.io
const ioServer = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_CLIENT_SERVER
        : process.env.CLIENT_SERVER,
  },
});

const userRoomMapByNamespace: Record<string, Map<string, string>> = {};

const userNamespace = ioServer.of("/user");
userNamespace.on("connection", (socket) => {
  const namespaceName = "user";
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userRoomMapByNamespace[namespaceName];

  socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;

    disconnectPreviousSockets({
      namespace: userNamespace,
      namespaceName: "user",
      wsData,
      userSocketMap,
    });
    await socket.join(roomId);
    userSocketMap.set(wsData.payload.userId, socket.id);
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.UNSYNC, (wsData: UserSocketData) => {
    const curSocketId = userSocketMap.get(wsData.payload.userId);
    if (curSocketId) userNamespace.sockets.get(curSocketId)?.disconnect();
  });

  socket.on(EVENT_NAMES.USER_READY, (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    userNamespace.to(roomId).emit("user", wsData);
  });

  socket.on(EVENT_NAMES.USER_WAITING_FOR_DATA, (wsData: UserSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    userNamespace.to(roomId).emit("user", wsData);
  });

  // socket.on("disconnecting", async () => {
  //   await disconnectController({
  //     userNamespace,
  //     instanceId: wsData.payload.instanceId,
  //     userId: wsData.payload.userId,
  //   });
  // });
});

const mediaNamespace = ioServer.of("/media");
mediaNamespace.on("connection", (socket) => {
  // Initialize the user-room map for the namespace if not exists
  const namespaceName = "media";
  if (!userRoomMapByNamespace[namespaceName]) {
    userRoomMapByNamespace[namespaceName] = new Map();
  }
  const userSocketMap = userRoomMapByNamespace[namespaceName];
  socket.on(EVENT_NAMES.JOIN_ROOM, async (wsData: MediaSocketData) => {
    const roomId = wsData.payload.instanceId as string;
    disconnectPreviousSockets({
      namespace: mediaNamespace,
      namespaceName: "media",
      wsData,
      userSocketMap,
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
      userRoomMapByNamespace,
    })
  );
});

ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  //CHAT
  socket.on(EVENT_NAMES.MESSAGE_EMITTED, (message: MessageDataApi) => {
    ioServer.emit(EVENT_NAMES.MESSAGE_EMITTED, message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

export default expressServer;
