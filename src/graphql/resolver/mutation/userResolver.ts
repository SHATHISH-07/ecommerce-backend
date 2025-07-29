import userModel from "../../../models/userModel";
import { MyContext, UserModelWithoutPassword } from "../../../types";
import bcrypt from "bcrypt";
import { getCurrentUser } from "../../../utils/getUser";
import { formatUser } from "../../../utils/userReturn";

const userResolver = {
    Mutation: {
        updateUserProfile: async (
            _: unknown,
            args: {
                input: {
                    name?: string;
                    username?: string;
                    email?: string;
                    address?: string;
                    phone?: string;
                    country?: string;
                    state?: string;
                    city?: string;
                    zipCode?: string;
                };
            },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {

            // console.log("updateUserProfile context", context);

            const currentUser = getCurrentUser(context);

            const user = await userModel.findById(currentUser.userId);
            if (!user) {
                throw new Error("User not found.");
            }

            const {
                name,
                username,
                email,
                address,
                phone,
                country,
                state,
                city,
                zipCode,
            } = args.input;

            if (name) user.name = name;
            if (username) user.username = username;
            if (email) user.email = email;
            if (address) user.address = address;
            if (phone) user.phone = phone;
            if (country) user.country = country;
            if (state) user.state = state;
            if (city) user.city = city;
            if (zipCode) user.zipCode = zipCode;

            await user.save();

            return formatUser(user);
        },

        updatePassword: async (
            _: unknown,
            args: { currentPassword: string; newPassword: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            try {

                // console.log("updatePassword context", context);

                const currentUser = getCurrentUser(context);

                if (!currentUser) {
                    return { success: false, message: "Authentication required." };
                }


                const user = await userModel.findById(currentUser.userId);
                if (!user) {
                    return { success: false, message: "User not found." };
                }

                const isMatch = await bcrypt.compare(args.currentPassword, user.password);
                if (!isMatch) {
                    return { success: false, message: "Current password is incorrect." };
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(args.newPassword, salt);
                user.password = hashedPassword;

                await user.save();

                return { success: true, message: "Password updated successfully." };
            } catch (err) {
                console.error("Error in updatePassword:", err);
                return { success: false, message: "Something went wrong." };
            }
        },

        deleteAccount: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<{ success: boolean, message: string }> => {
            try {
                const currentUser = getCurrentUser(context);

                if (!currentUser) {
                    throw new Error("Authentication required.");
                }

                const user = await userModel.findByIdAndDelete(currentUser.userId);

                if (!user) {
                    throw new Error("User not found.");
                }

                return { success: true, message: "Account deleted successfully." };
            } catch (error) {
                console.error("Delete Account Error:", error); // helpful for debugging
                return { success: false, message: "Something went wrong." };
            }
        }

    },
}

export default userResolver