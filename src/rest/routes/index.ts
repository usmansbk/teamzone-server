import express from "express";
import userRouter from "./user";
import teamRouter from "./team";
import authMiddleware from "../middlewares/auth";

const v1Router = express.Router();

v1Router.use(authMiddleware);
v1Router.use("/user", userRouter);
v1Router.use("/team", teamRouter);

export default v1Router;
