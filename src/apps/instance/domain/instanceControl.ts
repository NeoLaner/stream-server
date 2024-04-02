import {
  type ExpressMiddlewareFn,
  type InstanceReq,
  type InstanceRes,
  type JwtPayloadInstance,
} from "@/utils/@types";
import AppError from "@/utils/classes/appError";
import catchAsync from "@/utils/factory/catchAsync";
import { createAndSendTheToken } from "@/libraries/auth/authControl";
import Instance from "../data-access/instanceModel";
import Room from "../../room/data-access/roomModel";

export const createInstance: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const reqData = req.body as Record<keyof InstanceReq, unknown>;
    //eslint-disable-next-line
    const userId = req.user?._id!;
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
          guests: [],
          rootRoom: {
            _id: rootRoomData._id,
            crossorigin: rootRoomData.crossorigin,
            roomAuthor: rootRoomData.roomAuthor,
            roomName: rootRoomData.roomName,
            subtitles: rootRoomData.subtitles,
            videoLinks: rootRoomData.videoLinks,
            media: rootRoomData.media,
          },
        },
      },
    };

    const jwtPayloadInstance: JwtPayloadInstance = {
      instance: { instanceId: roomInstanceData._id, user_id: userId },
    };

    createAndSendTheToken(
      "instanceJwt",
      jwtPayloadInstance,
      200,
      false,
      res,
      `/instance/${roomInstanceData._id.toString()}`,
      respondData
    );
    // res.status(200).send(respondData);
  }
);

export const getInstance: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res, next) {
    const { instanceId } = req.params;

    const roomInstanceData = await Instance.findById(instanceId);
    if (!roomInstanceData)
      return next(new AppError("There is no instance with this id", 404));

    const rootRoomData = await Room.findById(roomInstanceData.rootRoom._id);

    if (!rootRoomData)
      return next(
        new AppError("There is no root room with id you provided.", 404)
      );

    const respondData: InstanceRes = {
      status: "success",
      data: {
        instance: {
          _id: roomInstanceData._id,
          hostId: roomInstanceData.hostId,
          guests: roomInstanceData.guests,
          rootRoom: {
            _id: rootRoomData._id,
            crossorigin: rootRoomData.crossorigin,
            roomAuthor: rootRoomData.roomAuthor,
            roomName: rootRoomData.roomName,
            subtitles: rootRoomData.subtitles,
            videoLinks: rootRoomData.videoLinks,
            media: rootRoomData.media,
          },
        },
      },
    };

    res.status(200).send(respondData);
  }
);

export const getCountInstance: ExpressMiddlewareFn<void> = catchAsync(
  async function (req, res) {
    const countDocs = await Instance.collection.countDocuments();
    const respond = {
      status: "success",
      data: {
        instance: { countDocs },
      },
    };

    res.status(200).send(respond);
  }
);
