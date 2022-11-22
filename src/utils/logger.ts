import bunyan from "bunyan";

const logger = bunyan.createLogger({
  name: process.env.APP_NAME,
});

export default logger;
