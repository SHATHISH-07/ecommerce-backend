import { IResolvers } from "@graphql-tools/utils";
import signupResolver from "./mutation/signupResolver";
import loginResolver from "./mutation/loginResolver";
import getUserResolver from "./query/getUsersResolver";
import getProductsResolver from "./query/getProductsResolver";
import getCategoryResolver from "./query/getCategoryResolver";
import addToCartResolver from "./mutation/addToCartResolver";
import getUserCart from "./query/getUserCartResolver";
import userOrderResolver from "./mutation/userOrderResolver";
import getUserOrderResolver from "./query/getUserOrdersResolver";

const resolvers: IResolvers = {

    Query: {
        ...getUserResolver.Query,
        ...getProductsResolver.Query,
        ...getCategoryResolver.Query,
        ...getUserCart.Query,
        ...getUserOrderResolver.Query,
    },

    Mutation: {
        ...signupResolver.Mutation,
        ...loginResolver.Mutation,
        ...addToCartResolver.Mutation,
        ...userOrderResolver.Mutation,
    },
};

export default resolvers;