import path from "path";
import fs from "fs";
import { ExpressMiddlewareFn } from "@/utils/@types";

export const videoStream: ExpressMiddlewareFn<void> = function (req, res) {
  const fileName = "bigbuck1.mp4";
  const filePath = path.join(__dirname, "../public", fileName);

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const { range } = req.headers;

  if (range) {
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
      "Access-Control-Allow-Origin":
        process.env.NODE_ENV === "development"
          ? process.env.LOCAL_CLIENT_SERVER
          : process.env.CLIENT_SERVER,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = { "Content-Length": fileSize, "Content-Type": "video/mp4" };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};
