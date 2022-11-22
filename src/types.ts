import type { TFunction } from "i18next";
import type { PrismaClient } from "@prisma/client";

export interface AppContext {
  language: string;
  t: TFunction<"translation", undefined>;
  prismaClient: PrismaClient;
}

declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}
