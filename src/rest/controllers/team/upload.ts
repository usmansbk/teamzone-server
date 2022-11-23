import { NextFunction, Request, Response } from "express";
import uploader from "src/rest/utils/uploader";

const upload = uploader.single("logo");

export default function uploadLogo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload(req, res, (err) => {
    if (err) {
      next(err);
    } else {
      const { file } = req;
      res.json({
        message: "File uploaded",
        file,
      });
    }
  });
}
