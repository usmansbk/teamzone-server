import "src/config/env";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import schema from "./graphql/schema";
import Sentry, { initializeSentry } from "./config/sentry";
import logger from "./utils/logger";
import i18nMiddleware from "./middlewares/i18n";
import contextMiddleware from "./middlewares/context";
import limiterMiddleware from "./middlewares/apiRateLimiter";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import v1Router from "./rest/routes";
import type { AppContext } from "./types";

const app = express();

initializeSentry(app);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(cors<cors.CorsRequest>());
app.use(bodyParser.json());
app.use(i18nMiddleware());
app.use(contextMiddleware);
app.use(limiterMiddleware);

const startServer = async () => {
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer<AppContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Ensure we wait for our server to start
  await server.start();

  app.set("trust proxy", 1);
  app.get("/ip", (request, response) => response.send(request.ip));

  app.use("/v1", v1Router);
  app.use(
    "/graphql",
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => req.context,
    })
  );

  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandlerMiddleware);

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 4000 }, resolve);
  });

  logger.info("🚀 Server ready at http://localhost:4000/graphql");
};

startServer();
