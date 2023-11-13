import Room from "../models/roomModel";
import {
  RoomDataRes,
  type ExpressMiddlewareFn,
  RoomDataReq,
} from "../utils/@types";
import catchAsync from "../utils/factory/catchAsync";

export const roomCreate: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const reqData = req.body as Record<keyof RoomDataReq, unknown>;

    const userId = req.user?._id;

    const data = await Room.create({
      ...reqData,
      roomAuthor: userId,
    });

    const respondData: RoomDataRes = {
      status: "success",
      data: { room: data },
    };

    res.status(200).send(respondData);
  }
);
