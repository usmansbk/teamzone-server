import express from "express";
import uploadPicture from "../controllers/user/upload";

const router = express.Router();

router.post("/:id/picture", uploadPicture);

export default router;
