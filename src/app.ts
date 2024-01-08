import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import userRouter from "./routes/userRouter";
import AppError from "./utils/classes/appError";
import globalErrorControl from "./controllers/errorControl";
import videoRouter from "./routes/videoRouter";
import roomRouter from "./routes/roomRouter";
import instanceRouter from "./routes/instanceRouter";
import { userNamespaceRouter } from "./routes/userNamespaceRouter";
import { mediaNamespaceRouter } from "./routes/mediaNamespaceRouter";
import type { MediaNamespace, SocketData, UserNamespace } from "./utils/@types";

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

//User Namespace
const userNamespace: UserNamespace = ioServer.of("/user");
const { socketRouter } = userNamespaceRouter(userNamespace);

userNamespace.on("connection", socketRouter);

//Media namespace
const mediaNamespace: MediaNamespace = ioServer.of("/media");
const { mediaSocketRouter } = mediaNamespaceRouter(mediaNamespace);

mediaNamespace.on("connection", mediaSocketRouter);

//Default namespace
ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

export default expressServer;
