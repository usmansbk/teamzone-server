import { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import { FILE_UPLOAD_ERROR } from "src/constants/errors";
import uploader from "src/rest/utils/uploader";
import { UploadFile } from "src/types/index";

const upload = uploader.single("avatar");

export default function uploadPicture(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload(req, res, async (err) => {
    if (err) {
      next(err);
    } else {
      const {
        file,
        params,
        context: { prismaClient },
      } = req;

      const { id } = params as { id: string };

      if (file) {
        const { bucket, key, size, mimetype, originalname } =
          file as unknown as UploadFile;
        const avatar = await prismaClient.file.create({
          data: {
            name: originalname,
            bucket,
            key,
            size,
            mimetype,
            userAvatars: {
              connect: {
                id,
              },
            },
          },
        });

        res.status(201).json({
          message: "File uploaded",
          id,
          avatar,
        });
      } else {
        next(
          new GraphQLError(req.t(FILE_UPLOAD_ERROR), {
            extensions: {
              code: FILE_UPLOAD_ERROR,
            },
          })
        );
      }
    }
  });
}
