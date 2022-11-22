import type { Request, Response, NextFunction } from "express";
import prismaClient from "src/config/database";

const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { t, language } = req;

  req.context = {
    t,
    language,
    prismaClient,
  };

  next();
};

export default contextMiddleware;
