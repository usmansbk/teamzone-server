import { File, PrismaClient } from "@prisma/client";
import { s3 } from "src/services/s3";

const prismaClient = new PrismaClient();

prismaClient.$use(async (params, next) => {
  const result = await next(params);

  if (params.model === "File" && params.action === "delete") {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: (result as File).key,
    });
  }

  return result;
});

export default prismaClient;
