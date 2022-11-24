import { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import { FILE_UPLOAD_ERROR } from "src/constants/errors";
import uploader from "src/rest/utils/uploader";
import { UploadFile } from "src/types/index";
import logger from "src/utils/logger";

const upload = uploader.single("logo");

export default function uploadLogo(
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
            const oldLogo = await t.file.findFirst({
              where: {
                teamLogoId: id,
              },
            });

            if (oldLogo) {
              await t.file.delete({
                where: {
                  id: oldLogo.id,
                },
                select: {
                  key: true,
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
                teamLogo: {
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
        logger.error({ message: (e as Error).message });
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
