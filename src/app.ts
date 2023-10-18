import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { MessageDataApi } from "./utils/@types/types";
import EVENT_NAMES from "./utils/constants/EVENT_NAMES";

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    //NOTE: allows cross-origin requests to include credentials
    //(such as cookies, HTTP authentication, and client-side SSL certificates).
    // credentials: true,
    //NOTE: origin: true (or origin: '*') allows requests from any origin (domain).
    //This essentially opens up your server to cross-origin requests from any site.
    // origin: process.env.NODE_ENV === "development" ? true : "",
    origin: "*",
  })
);

app.get("/video/:filename", (req, res) => {
  const filepath = "src/bigbuck.mp4";
  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const { range } = req.headers;

  if (range) {
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;
    const file = fs.createReadStream(filepath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
      "Access-Control-Allow-Origin": "http://localhost:5173",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    console.log("No range in header");
    const head = { "Content-Length": fileSize, "Content-Type": "video/mp4" };
    res.writeHead(200, head);
    fs.createReadStream(filepath).pipe(res);
  }
});

const expressServer = http.createServer(app);

//Socket.io
const ioServer = new Server(expressServer, {
  cors: {
    origin: "*",
  },
});

// ioServer.on("connect", (data) => {
//   console.log("client connected", data.id);
// });

ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("messageFromClient", (data) => {
    console.log(data);
  });

  socket.on("readyToPlay", (data) => {
    console.log(data);
  });

  socket.on("pause", (data) => {
    console.log(data);
  });

  socket.on(EVENT_NAMES.MESSAGE_EMITTED, (message: MessageDataApi) => {
    console.log(message);
    ioServer.emit(EVENT_NAMES.MESSAGE_EMITTED, message);
  });

  socket.on(EVENT_NAMES.VIDEO_PAUSED, () => {
    ioServer.emit(EVENT_NAMES.VIDEO_PAUSED);
  });

  socket.on(EVENT_NAMES.VIDEO_PLAYED, () => {
    ioServer.emit(EVENT_NAMES.VIDEO_PLAYED);
  });
});

export default expressServer;
