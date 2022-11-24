import btoa from "btoa";
import { File } from "@prisma/client";

export default function fileUrl(
  file: File,
  { width, height }: { width: number; height: number }
) {
  const { bucket, key } = file;

  const request = {
    bucket,
    key,
    edits: {
      resize: {
        width,
        height,
        fit: "fill",
      },
    },
  };

  return `${process.env.CLOUDFRONT_API_ENDPOINT}${btoa(
    JSON.stringify(request)
  )}`;
}
