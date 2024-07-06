export type InstanceReq = {
  password?: string;
  rootRoomId: string;
};

export type InstanceRes = {
  id: string;
  name: string;
  ownerId: string;
  roomId: string;
  online: boolean;
  timeWatched: Date | null;
  season: number | null;
  episode: number | null;
  guests: string[]; // Replace `any` with the specific type if known
};

export type InstanceLoginData = {
  instanceId: string;
  user_id: string;
};

export interface JwtPayloadInstance {
  instance: InstanceLoginData;
  iat?: number;
  exp?: number;
}
