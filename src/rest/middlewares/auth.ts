import { Request, Response, NextFunction } from "express";
import { GraphQLError } from "graphql";
import { AUTHENTICATION_ERROR } from "src/constants/errors";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { context } = req;

  const { currentUser, t } = context;

  if (!currentUser) {
    return next(
      new GraphQLError(t(AUTHENTICATION_ERROR, { ns: "errors" }), {
        extensions: {
          code: AUTHENTICATION_ERROR,
        },
      })
    );
  }
  return next();
};

export default authMiddleware;
