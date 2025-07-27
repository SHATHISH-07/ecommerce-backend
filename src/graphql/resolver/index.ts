import { IResolvers } from "@graphql-tools/utils";
import signupResolver from "./mutation/signupResolver";
import loginResolver from "./mutation/loginResolver";
import getUserResolver from "./query/getUsersResolver";
import getProductsResolver from "./query/getProductsResolver";
import getCategoryResolver from "./query/getCategoryResolver";
import userResolver from "./mutation/userResolver";
import adminResolver from "./mutation/adminResolver";
import getAdminResolver from "./query/getAdminResolver";

const resolvers: IResolvers = {

    Query: {
        ...getUserResolver.Query,
        ...getProductsResolver.Query,
        ...getCategoryResolver.Query,

        ...getAdminResolver.Query
    },

    Mutation: {
        ...signupResolver.Mutation,
        ...loginResolver.Mutation,
        ...userResolver.Mutation,
        ...adminResolver.Mutation
    },
};

export default resolvers;