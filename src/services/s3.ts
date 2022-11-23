import { S3Client, S3 } from "@aws-sdk/client-s3";

const { AWS_REGION } = process.env;

export const s3Client = new S3Client({
  region: AWS_REGION,
});

export const s3 = new S3({
  region: AWS_REGION,
});
