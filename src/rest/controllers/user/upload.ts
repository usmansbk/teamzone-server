import { NextFunction, Request, Response } from "express";
import multer from "multer";

const upload = multer({
  dest: "/upload",
  limits: {
    fileSize: 2000000,
  },
}).single("avatar");

export default function uploadPicture(
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
