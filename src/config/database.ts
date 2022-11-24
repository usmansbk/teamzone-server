import { File, PrismaClient } from "@prisma/client";
import { s3 } from "src/services/s3";

const prismaClient = new PrismaClient();

prismaClient.$use(async (params, next) => {
  const result = await next(params);

  if (params.model === "File" && params.action === "delete") {
    const { key: Key, bucket: Bucket } = result as File;

    await s3.deleteObject({ Key, Bucket });
  }

  return result;
});

export default prismaClient;
