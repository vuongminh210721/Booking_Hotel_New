import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "./env";

export const generateToken = (userId: string): string => {
  const payload = { userId };
  const secret = config.jwtSecret as Secret;
  const options = { expiresIn: config.jwtExpire as any };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
