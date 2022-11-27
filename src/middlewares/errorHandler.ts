/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "src/constants/errors";
import AuthenticationError from "src/utils/errors/AuthenticationError";
import ForbiddenError from "src/utils/errors/ForbiddenError";
import QueryError from "src/utils/errors/QueryError";

const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  let status: number;
  let { message } = error as Error;

  if (error instanceof QueryError) {
    status = 400;
  } else if (error instanceof AuthenticationError) {
    status = 401;
  } else if (error instanceof ForbiddenError) {
    status = 403;
  } else {
    status = 500;
    message = req.t(INTERNAL_SERVER_ERROR, { ns: "errors" });
  }

  res.status(status).json({
    message,
  });
};

export default errorHandlerMiddleware;
