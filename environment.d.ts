declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      APP_NAME: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SENTRY_DSN: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_PASSWORD: string;
      DB_USER: string;
      DATABASE: string;
      DATABASE_URL?: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      JWT_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
