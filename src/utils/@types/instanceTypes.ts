import mongoose, { Types } from "mongoose";
import { InstanceData, RoomData, Status } from "./globalTypes";

export type InstanceReq = {
  password?: string;
  rootRoomId: string;
};

export type InstanceRes = {
  status: Status;
  data: {
    instance: {
      _id: Types.ObjectId;
      hostId: Types.ObjectId;
      guests: InstanceData["guests"];
      rootRoom: Pick<
        RoomData,
        | "_id"
        | "cover"
        | "crossorigin"
        | "roomAuthor"
        | "roomName"
        | "subtitles"
        | "videoLink"
      >;
    };
  };
  //guests
  //messages
};

export type InstanceLoginData = {
  instanceId: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
};

export interface JwtPayloadInstance {
  instance: InstanceLoginData;
  iat?: number;
  exp?: number;
}
