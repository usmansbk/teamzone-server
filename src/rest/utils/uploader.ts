import multer from "multer";

export default multer({
  dest: "/upload",
  limits: {
    fileSize: 2000000,
  },
});
