import mongoose, { Types } from "mongoose";
import Room from "../data-access/roomModel";
import {
  RoomDataRes,
  type ExpressMiddlewareFn,
  RoomDataReq,
} from "../../../utils/@types";

import catchAsync from "../../../utils/factory/catchAsync";
import AppError from "../../../utils/classes/appError";

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

export const getRoom: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id))
      return next(new AppError("invalid instance id.", 400));

    const mongooseId = new mongoose.Types.ObjectId(id);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    const data = await Room.findById(mongooseId);

    if (!data) return next(new AppError("No room found with this id.", 404));

    const respondData: RoomDataRes = {
      status: "success",
      data: { room: data },
    };

    res.status(200).send(respondData);
  }
);

export const getCountRoom: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const countDocs = await Room.collection.countDocuments();
    const respond = {
      status: "success",
      data: {
        room: { countDocs },
      },
    };

    res.status(200).send(respond);
  }
);
