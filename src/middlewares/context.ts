import type { Request, Response, NextFunction } from "express";
import prismaClient from "src/config/database";
import jwt from "src/utils/jwt";

const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { t, language } = req;

  req.context = {
    t,
    language,
    prismaClient,
    jwt,
  };

  next();
};

export default contextMiddleware;
