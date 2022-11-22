import Redis from "ioredis";

const { REDIS_HOST } = process.env;

const redisClient = new Redis({
  host: REDIS_HOST,
});

export default redisClient;
