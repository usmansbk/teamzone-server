/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ApolloServerErrorCode } from "@apollo/server/errors";

const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  let code;
  if (
    error instanceof JsonWebTokenError ||
    error instanceof TokenExpiredError
  ) {
    res.statusCode = 401;
    code = error.name;
  } else {
    code = ApolloServerErrorCode.INTERNAL_SERVER_ERROR;
    res.statusCode = 500;
  }
  res.json({ error: { code, message: error.message } });
};

export default errorHandlerMiddleware;
