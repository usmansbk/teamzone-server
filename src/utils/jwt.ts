import jwt from "jsonwebtoken";

export function sign(payload: string | object | Buffer) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365d" });
}

export function verify(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const jwtUtil = { sign, verify };

export type JwtUtil = typeof jwtUtil;

export default jwtUtil;
