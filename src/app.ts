import express from "express";
import http from "http";
import { Server } from "socket.io";
import { mediaNamespaceRouter } from "./apps/media/mediaNamespaceRouter";
import type { ChatNamespace, MediaNamespace, SocketData } from "./utils/@types";
import { chatNamespaceRouter } from "./apps/chat/entry-points/api/chatNamespaceRouter";

const app = express();

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
            `https://scoap.ir`,
            `https://www.scoap.ir`,
            "http://localhost:3000",
            "http://127.0.0.1:5173",
          ],
    credentials: true,
  },
});

//User Namespace
// const userNamespace: UserNamespace = ioServer.of("/user");
// const { socketRouter } = userNamespaceRouter(userNamespace);

// userNamespace.on("connection", socketRouter);

//Media namespace
const mediaNamespace: MediaNamespace = ioServer.of("/media");
mediaNamespace.on("connection", mediaNamespaceRouter(mediaNamespace));

//Chat namespace
// const chatNamespace: ChatNamespace = ioServer.of("/chat");
// const { chatSocketRouter } = chatNamespaceRouter(chatNamespace);
// chatNamespace.on("connection", chatSocketRouter);

export default expressServer;
