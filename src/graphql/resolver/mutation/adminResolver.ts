import userModel from "../../../models/userModel";
import { Role, MyContext, UserModelWithoutPassword } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import { formatUser } from "../../../utils/userReturn";



const userResolver = {
    Mutation: {

        // Update user role
        updateUserRole: async (
            _: unknown,
            args: { userId: string; newRole: Role },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);


            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can update user roles.");
            }


            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date()

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    role: args.newRole,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        // Deactivate User
        deactivateUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can deactivate users.");
            }

            console.log(currentUser.userId)

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isActive: false,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user)
        },

        // Activate User
        activateUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can activate users.");
            }

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isActive: true,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt,
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user)
        },

        // Ban User 
        banUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can ban users.");
            }

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot ban yourself.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isBanned: true,
                    updatedBy: currentUser.userId,
                    updatedAt
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user);
        },
    }

}

export default userResolver;