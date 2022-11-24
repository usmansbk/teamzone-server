import type { Request } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "src/services/redis";
import { TOO_MANY_API_REQUESTS } from "src/constants/errors";

const MAX_API_REQUESTS = 2000;

const limiterMiddleware = rateLimit({
  windowMs: 60 * 60 * 60 * 1000, // 60 minutes
  max: MAX_API_REQUESTS, // Limit requests per `window` (here, per hour)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: (req: Request) => {
    const { t } = req;
    return t(TOO_MANY_API_REQUESTS, { max: MAX_API_REQUESTS, ns: "errors" });
  },
  store: new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
});

export default limiterMiddleware;
