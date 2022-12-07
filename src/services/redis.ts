import Redis from "ioredis";

const { REDIS_HOST, REDIS_URL } = process.env;

const createClient = () => {
  if (REDIS_URL) {
    return new Redis(REDIS_URL);
  }
  return new Redis({
    host: REDIS_HOST,
  });
};

export default createClient();
