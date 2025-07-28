import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import resolvers from "./graphql/resolver/index";
import typeDefs from "./graphql/schema/schema";
import context from "./context";

import { graphqlUploadExpress } from "graphql-upload-ts";


const app = express();

app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

const server = new ApolloServer({
    resolvers,
    typeDefs,
    context: async ({ req }) => await context({ req }),
});


export const startApolloServer = async () => {
    await server.start();
    server.applyMiddleware({ app: app as any });

    return app;
};