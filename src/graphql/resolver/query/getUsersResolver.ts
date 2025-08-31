import userModel from "../../../models/userModel";
import { UserModelWithoutPassword, Role, MyContext } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import { formatCurrentUser, formatUser } from "../../../utils/userReturn";



const getUserResolver = {
    Query: {
        getCurrentUser: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {

            // console.log("query context", context)

            const currentUser = getCurrentUser(context);
            if (!currentUser) throw new Error("Not authenticated");
            return formatCurrentUser(currentUser);
        },

        getUser: async (
            _: unknown,
            args: { username?: string; email?: string; userId?: string }
        ): Promise<UserModelWithoutPassword> => {
            const searchParams: { [key: string]: string } = {};

            if (args.username) searchParams.username = args.username;
            if (args.email) searchParams.email = args.email;
            if (args.userId) searchParams._id = args.userId;

            if (Object.keys(searchParams).length === 0) {
                throw new Error("At least one search parameter must be provided.");
            }

            const user = await userModel.findOne(searchParams).lean();

            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        getUsers: async (): Promise<UserModelWithoutPassword[]> => {
            const users = await userModel.find({ role: "user" }).lean();
            return users.map(user => formatUser(user));
        },

        getUserById: async (
            _: unknown,
            args: { id: string }
        ): Promise<UserModelWithoutPassword> => {
            const user = await userModel.findById(args.id).lean();
            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        getUsersByRole: async (
            _: unknown,
            args: { role: Role }
        ): Promise<UserModelWithoutPassword[]> => {
            const users = await userModel.find({ role: args.role }).lean();
            return users.map(formatUser);
        },

        getUsersByStatus: async (
            _: unknown,
            args: { isActive: boolean }
        ): Promise<UserModelWithoutPassword[]> => {
            const users = await userModel.find({ isActive: args.isActive }).lean();
            return users.map(formatUser);
        },

    }
};

export default getUserResolver;
