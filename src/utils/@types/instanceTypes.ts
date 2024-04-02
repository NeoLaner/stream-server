import { Types } from "mongoose";
import { type InstanceData, type RoomData, type Status } from "./globalTypes";

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
        | "crossorigin"
        | "roomAuthor"
        | "roomName"
        | "subtitles"
        | "videoLinks"
        | "media"
      >;
    };
  };
  //guests
  //messages
};

export type InstanceLoginData = {
  instanceId: Types.ObjectId;
  user_id: Types.ObjectId;
};

export interface JwtPayloadInstance {
  instance: InstanceLoginData;
  iat?: number;
  exp?: number;
}
