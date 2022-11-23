import express from "express";
import uploadLogo from "../controllers/team/upload";

const router = express.Router();

router.post("/logo", uploadLogo);

export default router;
