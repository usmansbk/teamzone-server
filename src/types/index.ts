import type { TFunction } from "i18next";
import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";
import type { JwtUtil } from "src/utils/jwt";
import { User } from "@sentry/node";

export * from "./graphql";

export interface AppContext {
  language: string;
  t: TFunction<"translation", undefined>;
  prismaClient: PrismaClient;
  redisClient: Redis;
  jwt: JwtUtil;
  currentUser?: User | null;
}

declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}

export interface UploadFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
}
