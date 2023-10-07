import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
const ioServer = new Server(expressServer);
ioServer.on("messageFromClient", (data) => {
  console.log(data);
});

export default expressServer;
