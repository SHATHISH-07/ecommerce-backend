import { ApolloServer } from "apollo-server";
import resolvers from "./graphql/resolver/index";
import typeDefs from "./graphql/schema/schema";
import context from "./context";

const server = new ApolloServer({
    resolvers,
    typeDefs,
    context: async ({ req }) => await context({ req }),
});


export { server };