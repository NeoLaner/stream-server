import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { promisify } from "util";

interface JwtPayload {
  user: {
    _id: mongoose.ObjectId;
    userId: string;
    photo: string;
    name: string;
  };
  iat: number;
  exp: number;
}

async function decodeToken(token: string) {
  const verifyAsync = promisify(jwt.verify) as unknown as (
    token: string,
    key: string
  ) => Promise<JwtPayload>;

  const decoded = await verifyAsync(token, process.env.SECRET_KEY!);

  return decoded;
}

export default decodeToken;
