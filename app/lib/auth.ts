import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET!;

    const decoded = jwt.verify(token, secret);

    return decoded;
  } catch {
    return null;
  }
}