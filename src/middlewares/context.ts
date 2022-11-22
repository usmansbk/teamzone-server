import type { Request, Response, NextFunction } from "express";
import prismaClient from "src/config/database";
import Sentry from "src/config/sentry";
import jwt from "src/utils/jwt";

const contextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { t, language, headers, i18n } = req;

  const { authorization } = headers;

  if (authorization) {
    const { id } = jwt.verify(authorization) as { id: string };
    const currentUser = await prismaClient.user.findUnique({ where: { id } });

    if (currentUser) {
      Sentry.setUser({
        id: currentUser?.id,
        email: currentUser.email,
      });

      if (currentUser.locale) {
        await i18n.changeLanguage(currentUser.locale);
      }

      req.context = { ...req.context, currentUser };
    }
  }

  req.context = {
    ...req.context,
    t,
    language,
    prismaClient,
    jwt,
  };

  next();
};

export default contextMiddleware;
