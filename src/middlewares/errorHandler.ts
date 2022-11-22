/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError } from "graphql";

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

  res.json({
    error: new GraphQLError(error.message, {
      extensions: {
        code,
      },
    }),
  });
};

export default errorHandlerMiddleware;
