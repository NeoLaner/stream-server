import jwt from "jsonwebtoken";
import { promisify } from "util";

async function decodeToken<JwtPayload>(token: string) {
  const verifyAsync = promisify(jwt.verify) as unknown as (
    token: string,
    key: string
  ) => Promise<JwtPayload>;
  const decoded = await verifyAsync(token, process.env.SECRET_KEY!);

  return decoded;
}

export default decodeToken;
