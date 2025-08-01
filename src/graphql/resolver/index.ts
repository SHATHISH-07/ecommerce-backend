import { IResolvers } from "@graphql-tools/utils";
import signupResolver from "./mutation/signupResolver";
import loginResolver from "./mutation/loginResolver";
import getUserResolver from "./query/getUsersResolver";
import getProductsResolver from "./query/getProductsResolver";
import getCategoryResolver from "./query/getCategoryResolver";
import getAdminResolver from "./query/getAdminResolver";
import getUserCartResolver from "./query/getUserCartResolver";
import userResolver from "./mutation/userResolver";
import adminResolver from "./mutation/adminResolver";
import productResolver from "./mutation/productResolver";
import categoryResolver from "./mutation/categoryResolver";
import cartResolver from "./mutation/cartResolver";

const resolvers: IResolvers = {

    Query: {
        ...getUserResolver.Query,
        ...getProductsResolver.Query,
        ...getCategoryResolver.Query,
        ...getAdminResolver.Query,
        ...getUserCartResolver.Query
    },

    Mutation: {
        ...signupResolver.Mutation,
        ...loginResolver.Mutation,
        ...userResolver.Mutation,
        ...adminResolver.Mutation,
        ...productResolver.Mutation,
        ...categoryResolver.Mutation,
        ...cartResolver.Mutation
    },
};

export default resolvers;