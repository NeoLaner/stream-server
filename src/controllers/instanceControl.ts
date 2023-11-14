import Instance from "../models/instanceModel";
import Room from "../models/roomModel";
import {
  type ExpressMiddlewareFn,
  InstanceReq,
  InstanceRes,
} from "../utils/@types";
import AppError from "../utils/classes/appError";
import catchAsync from "../utils/factory/catchAsync";

export const createInstance: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const reqData = req.body as Record<keyof InstanceReq, unknown>;
    const userId = req.user?._id;
    const rootRoomData = await Room.findById(reqData.rootRoomId);

    if (!rootRoomData)
      throw new AppError("There is no root room with id you provided.", 404);

    const roomInstanceData = await Instance.create({
      ...reqData,
      rootRoom: reqData.rootRoomId,
      hostId: userId,
    });

    const respondData: InstanceRes = {
      status: "success",
      data: {
        instance: {
          _id: roomInstanceData._id,
          hostId: roomInstanceData.hostId,
          rootRoom: {
            _id: rootRoomData._id,
            cover: rootRoomData.cover,
            crossorigin: rootRoomData.crossorigin,
            roomAuthor: rootRoomData.roomAuthor,
            roomName: rootRoomData.roomName,
            subtitles: rootRoomData.subtitles,
            videoLink: rootRoomData.videoLink,
          },
        },
      },
    };

    res.status(200).send(respondData);
  }
);

export const getInstance: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const { instanceId } = req.params;

    const roomInstanceData = await Instance.findById(instanceId);
    if (!roomInstanceData)
      throw new AppError("There is no instance with this id", 404);

    const rootRoomData = await Room.findById(roomInstanceData.rootRoom._id);

    if (!rootRoomData)
      throw new AppError("There is no root room with id you provided.", 404);

    const respondData: InstanceRes = {
      status: "success",
      data: {
        instance: {
          _id: roomInstanceData._id,
          hostId: roomInstanceData.hostId,
          rootRoom: {
            _id: rootRoomData._id,
            cover: rootRoomData.cover,
            crossorigin: rootRoomData.crossorigin,
            roomAuthor: rootRoomData.roomAuthor,
            roomName: rootRoomData.roomName,
            subtitles: rootRoomData.subtitles,
            videoLink: rootRoomData.videoLink,
          },
        },
      },
    };

    res.status(200).send(respondData);
  }
);
