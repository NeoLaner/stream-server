import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { MessageDataApi, UserSocketData } from "./utils/@types";
import { EVENT_NAMES } from "./utils/constants";
import userRouter from "./routes/userRouter";
import AppError from "./utils/classes/appError";
import globalErrorControl from "./controllers/errorControl";
import videoRouter from "./routes/videoRouter";
import roomRouter from "./routes/roomRouter";
import instanceRouter from "./routes/instanceRouter";
import Instance from "./models/instanceModel";

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

// ioServer.on("connect", (data) => {
//   console.log("client connected", data.id);
// });

ioServer.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  //USER
  socket.on("user", async (data: UserSocketData) => {
    // await Instance.findByIdAndUpdate(data.payload.instanceId, data);
    const oldInstanceData = await Instance.findById(data.payload.instanceId);
    if (!oldInstanceData) return;
    const oldGuestData = oldInstanceData.guests.filter(
      (guest) => guest.userId !== data.payload.userId
    );
    await oldInstanceData?.updateOne({
      oldInstanceData,
      guests: [
        ...oldGuestData,
        {
          status: data.payload.status,
          userId: data.payload.userId,
          instanceId: data.payload.instanceId,
        },
      ],
    });
    await socket.join(data.payload.instanceId);
    console.log("user joined in this room:", data.payload.instanceId);
    socket.to(data.payload.instanceId).emit("user", data);
  });

  //MEDIA
  socket.on(EVENT_NAMES.VIDEO_PAUSED, () => {
    ioServer.emit(EVENT_NAMES.VIDEO_PAUSED);
  });

  socket.on(EVENT_NAMES.VIDEO_PLAYED, () => {
    ioServer.emit(EVENT_NAMES.VIDEO_PLAYED);
  });

  //CHAT
  socket.on(EVENT_NAMES.MESSAGE_EMITTED, (message: MessageDataApi) => {
    ioServer.emit(EVENT_NAMES.MESSAGE_EMITTED, message);
  });
});

export default expressServer;
