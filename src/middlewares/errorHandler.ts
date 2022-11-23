/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { GraphQLError } from "graphql";

const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  let err = error;
  if (
    error instanceof JsonWebTokenError ||
    error instanceof TokenExpiredError
  ) {
    err = new GraphQLError(error.message, {
      extensions: {
        code: error.name,
        http: {
          status: 400,
        },
      },
    });
  }

  res.json({
    error: err,
  });
};

export default errorHandlerMiddleware;
