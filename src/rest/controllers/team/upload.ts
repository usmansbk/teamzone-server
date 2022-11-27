import { NextFunction, Request, Response } from "express";
import uploader from "src/rest/utils/uploader";
import { UploadFile } from "src/types/index";
import QueryError from "src/utils/errors/QueryError";
import logger from "src/utils/logger";
import { FILE_UPLOAD_FAILED } from "src/constants/responseCodes";

const upload = uploader.single("logo");

export default function uploadLogo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload(req, res, async (err) => {
    const {
      file,
      params,
      context: { prismaClient, t },
    } = req;
    if (err) {
      next(err);
    } else {
      try {
        const { id } = params as { id: string };

        if (file) {
          const { bucket, key, size, mimetype, originalname } =
            file as unknown as UploadFile;

          const avatar = await prismaClient.$transaction(
            async (transaction) => {
              const oldLogo = await transaction.file.findFirst({
                where: {
                  teamLogoId: id,
                },
              });

              if (oldLogo) {
                await transaction.file.delete({
                  where: {
                    id: oldLogo.id,
                  },
                  select: {
                    key: true,
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
                  teamLogo: {
                    connect: {
                      id,
                    },
                  },
                },
              });
            }
          );

          res.status(201).json({
            message: "File uploaded",
            id,
            avatar,
          });
        } else {
          throw new Error("No file");
        }
      } catch (e) {
        logger.error({ message: (e as Error).message });
        next(new QueryError(t(FILE_UPLOAD_FAILED), e as Error));
      }
    }
  });
}
