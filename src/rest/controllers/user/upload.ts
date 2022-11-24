import { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import { FILE_UPLOAD_ERROR } from "src/constants/errors";
import uploader from "src/rest/utils/uploader";
import { UploadFile } from "src/types/index";
import logger from "src/utils/logger";

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
      try {
        const {
          file,
          params,
          context: { prismaClient },
        } = req;

        const { id } = params as { id: string };

        if (file) {
          const { bucket, key, size, mimetype, originalname } =
            file as unknown as UploadFile;

          const avatar = await prismaClient.$transaction(async (t) => {
            const oldAvatar = await t.file.findFirst({
              where: {
                userAvatarId: id,
              },
            });

            if (oldAvatar) {
              await t.file.delete({
                where: {
                  id: oldAvatar.id,
                },
              });
            }
            return t.file.create({
              data: {
                name: originalname,
                bucket,
                key,
                size,
                mimetype,
                userAvatar: {
                  connect: {
                    id,
                  },
                },
              },
            });
          });

          res.status(201).json({
            message: "File uploaded",
            id,
            avatar,
          });
        } else {
          throw new Error("No file");
        }
      } catch (e) {
        logger.error({ e });
        next(
          new GraphQLError(req.t(FILE_UPLOAD_ERROR, { ns: "errors" }), {
            extensions: {
              code: FILE_UPLOAD_ERROR,
            },
          })
        );
      }
    }
  });
}
