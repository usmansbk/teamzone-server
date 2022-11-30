import { NextFunction, Request, Response } from "express";
import uploader from "src/rest/utils/uploader";
import { UploadFile } from "src/types/index";
import QueryError from "src/utils/errors/QueryError";
import logger from "src/utils/logger";
import {
  FILE_UPLOADED,
  FILE_UPLOAD_FAILED,
  NO_FILE_TO_UPLOAD,
} from "src/constants/responseCodes";
import fileUrl from "src/utils/imageFileUrl";

const upload = uploader.single("avatar");

export default function uploadPicture(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload(req, res, async (err) => {
    const {
      file,
      context: { prismaClient, t, currentUser },
    } = req;
    if (err) {
      next(err);
    } else {
      try {
        if (file) {
          const { bucket, key, size, mimetype, originalname } =
            file as unknown as UploadFile;

          const avatar = await prismaClient.$transaction(
            async (transaction) => {
              const oldAvatar = await transaction.file.findFirst({
                where: {
                  userAvatarId: currentUser?.id,
                },
              });

              if (oldAvatar) {
                await transaction.file.delete({
                  where: {
                    id: oldAvatar.id,
                  },
                });
              }
              return transaction.file.create({
                data: {
                  name: originalname,
                  bucket,
                  key,
                  size,
                  mimetype,
                  userAvatar: {
                    connect: {
                      id: currentUser?.id,
                    },
                  },
                },
              });
            }
          );

          res.status(201).json({
            message: t(FILE_UPLOADED),
            id: currentUser?.id,
            picture: fileUrl(avatar, { width: 400, height: 400 }),
          });
        } else {
          res.status(400).json({
            message: t(NO_FILE_TO_UPLOAD),
          });
        }
      } catch (e) {
        logger.error({ e });
        next(new QueryError(t(FILE_UPLOAD_FAILED), e as Error));
      }
    }
  });
}
