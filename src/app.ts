import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import bodyParser from "body-parser";
//eslint-disable-next-line
//@ts-ignore
import xss from "xss-clean";

import userRouter from "./apps/user/entry-points/api/userRouter";
import AppError from "./utils/classes/appError";
import globalErrorControl from "./libraries/error/errorControl";
import videoRouter from "./apps/stream/domain/videoRouter";
import roomRouter from "./apps/room/entry-points/api/roomRouter";
import instanceRouter from "./apps/instance/entry-points/api/instanceRouter";
import { userNamespaceRouter } from "./apps/user/entry-points/api/userNamespaceRouter";
import { mediaNamespaceRouter } from "./apps/media/entry-points/api/mediaNamespaceRouter";
import type {
  ChatNamespace,
  MediaNamespace,
  SocketData,
  UserNamespace,
} from "./utils/@types";
import { chatNamespaceRouter } from "./apps/chat/entry-points/api/chatNamespaceRouter";
import chatRouter from "./apps/chat/entry-points/api/chatRouter";
import searchTmdbRouter from "./apps/tmdb/entry-points/api/searchTmdbRouter";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

app.use(helmet());
app.use(limiter);
app.use(bodyParser.json({ limit: "10kb" }));
app.use(ExpressMongoSanitize());
//eslint-disable-next-line
app.use(xss());

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
        : [
            `https://beta.scoap.ir`,
            `https://${process.env.CLIENT_SERVER}`,
            `https://www.${process.env.CLIENT_SERVER}`,
          ],
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

app.use("/video", videoRouter);
app.use("/users", userRouter);
app.use("/chats", chatRouter);
app.use("/room", roomRouter);
app.use("/instance", instanceRouter);
app.use("/tmdb", searchTmdbRouter);

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
        : [
            `https://${process.env.CLIENT_SERVER}`,
            `https://www.${process.env.CLIENT_SERVER}`,
          ],
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

//Chat namespace
const chatNamespace: ChatNamespace = ioServer.of("/chat");
const { chatSocketRouter } = chatNamespaceRouter(chatNamespace);
chatNamespace.on("connection", chatSocketRouter);

//Default namespace
ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

export default expressServer;
