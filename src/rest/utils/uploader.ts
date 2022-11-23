import { GraphQLError } from "graphql";
import multer from "multer";
import { UNSUPPORTED_FILE_TYPE_ERROR } from "src/constants/errors";

const supportedMimeTypes = ["image/jpeg", "image/png"];

export default multer({
  dest: "/upload",
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    const { t } = req;
    if (!supportedMimeTypes.includes(file.mimetype)) {
      cb(
        new GraphQLError(t(UNSUPPORTED_FILE_TYPE_ERROR), {
          extensions: {
            code: UNSUPPORTED_FILE_TYPE_ERROR,
          },
        })
      );
    } else {
      cb(null, true);
    }
  },
});
