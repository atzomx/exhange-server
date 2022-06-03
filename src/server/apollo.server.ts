import "reflect-metadata";
import { Log } from "@core/utils";
import { UserResolver } from "@entities/users";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import http from "http";
import * as path from "path";
import { buildSchema } from "type-graphql";

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    validate: false,
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  server.applyMiddleware({ app });

  return new Promise((resolve, reject) => {
    httpServer.listen(port).once("listening", resolve).once("error", reject);
  });
}

async function start() {
  try {
    const PORT = Number(process.env.PORT ?? 4000);
    await listen(PORT);
    Log.i("Server is ready at http://localhost:4000/graphql");
  } catch (err) {
    Log.e("Error starting the node server", err);
  }
}

export default { start };
