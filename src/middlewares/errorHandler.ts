/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";

const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  res.status(500).json({
    message: (error as Error).message,
  });
};

export default errorHandlerMiddleware;
