import Room from "../models/roomModel";
import { ExpressMiddlewareFn } from "../utils/@types";
import catchAsync from "../utils/factory/catchAsync";
import generateRandomRoomId from "../utils/factory/generateRandomId";

export const roomCreate: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const { roomName, videoLink } = req.body as {
      roomName: unknown;
      videoLink: unknown;
    };

    const roomId = generateRandomRoomId(12);
    const userId = req.user?._id;

    const data = await Room.create({
      hostId: userId,
      roomId,
      roomName,
      videoLink,
    });

    res.status(200).send({
      status: "success",
      data: { room: data },
    });
  }
);
