import multer from "multer";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { UNSUPPORTED_FILE_TYPE } from "src/constants/responseCodes";
import { s3Client } from "src/services/s3";
import QueryError from "src/utils/errors/QueryError";

const supportedMimeTypes = ["image/jpeg", "image/png"];

export default multer({
  dest: "/upload",
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    const { t } = req;
    if (!supportedMimeTypes.includes(file.mimetype)) {
      cb(new QueryError(t(UNSUPPORTED_FILE_TYPE)));
    } else {
      cb(null, true);
    }
  },
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    metadata(req, file, cb) {
      const { mimetype, size, fieldname, filename } = file;
      cb(null, { mimetype, size, fieldname, filename });
    },
    key(req, file, cb) {
      cb(null, `${file.fieldname}/${nanoid()}`);
    },
  }),
});
