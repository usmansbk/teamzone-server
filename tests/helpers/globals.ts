import Redis from "ioredis-mock";

afterEach((done) => {
  new Redis().flushall().then(() => done());
});
