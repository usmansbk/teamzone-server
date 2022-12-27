import type { Request, Response, NextFunction } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import prismaClient from "src/config/database";
import Sentry from "src/config/sentry";
import { INVALID_TOKEN } from "src/constants/responseCodes";
import redisClient from "src/services/redis";
import AuthenticationError from "src/utils/errors/AuthenticationError";
import jwt from "src/utils/jwt";

const contextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { t, language, headers, i18n } = req;

  req.context = { t, language, prismaClient, jwt, redisClient };

  const { authorization } = headers;

  if (authorization?.startsWith("Bearer")) {
    const token = authorization.split(" ")[1];
    try {
      const { id } = jwt.verify(token) as { id: string };
      // TODO: cache currentUser to redis
      const currentUser = await prismaClient.user.findUnique({
        where: { id },
      });

      if (currentUser) {
        req.context.currentUser = currentUser;

        Sentry.setUser({
          id: currentUser.id,
          email: currentUser.email,
        });

        if (currentUser.locale) {
          await i18n.changeLanguage(currentUser.locale);
        }
      }
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return next(new AuthenticationError(t(INVALID_TOKEN)));
      }
      return next(e);
    }
  }

  return next();
};

export default contextMiddleware;
