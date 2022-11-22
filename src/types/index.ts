import type { TFunction } from "i18next";
import type { PrismaClient } from "@prisma/client";
import type { JwtUtil } from "src/utils/jwt";

// export * from "./graphql";

export interface AppContext {
  language: string;
  t: TFunction<"translation", undefined>;
  prismaClient: PrismaClient;
  jwt: JwtUtil;
}

declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}
