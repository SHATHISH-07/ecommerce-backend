import userModel from "../../../models/userModel";
import { MyContext, UpdateUserProfileInput, UserModelWithoutPassword } from "../../../types";
import bcrypt from "bcrypt";
import { getCurrentUser } from "../../../utils/getUser";
import { formatUser } from "../../../utils/userReturn";
import OTPModel from "../../../models/OTPModel";
import { sendOtpEmail } from "../../../utils/sendEmail";
import otpGenerator from "../../../utils/otpGenerator";

const userResolver = {
    Mutation: {
        updateUserProfile: async (
            _: unknown,
            args: { input: UpdateUserProfileInput },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);
            const user = await userModel.findById(currentUser.userId);
            if (!user) throw new Error("User not found.");

            const { name, username, address, phone, country, state, city, zipCode } = args.input;

            if (name !== undefined) user.name = name;
            if (username !== undefined) user.username = username;
            if (address !== undefined) user.address = address;
            if (phone !== undefined) user.phone = phone;
            if (country !== undefined) user.country = country;
            if (state !== undefined) user.state = state;
            if (city !== undefined) user.city = city;
            if (zipCode !== undefined) user.zipCode = zipCode;

            await user.save();

            return formatUser(user);
        },

        updateUserEmail: async (
            _: unknown,
            args: { input: { email: string } },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);
            const user = await userModel.findById(currentUser.userId);
            if (!user) throw new Error("User not found.");

            const { email } = args.input;

            if (!email || email === user.email) {
                throw new Error("New email must be different from the current email.");
            }

            const existingUser = await userModel.findOne({ email });
            if (existingUser && existingUser.id !== user.id) {
                throw new Error("Email is already in use.");
            }

            user.email = email;
            user.emailVerified = false;

            const otp = otpGenerator();
            await OTPModel.findOneAndUpdate(
                { verificationIdentifier: email },
                { otp, createdAt: new Date() },
                { upsert: true, new: true }
            );


            await sendOtpEmail(email, otp, "Email Updated Verification OTP");
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
                user.password = await bcrypt.hash(args.newPassword, salt);


                await user.save();

                return { success: true, message: "Password updated successfully." };
            } catch (err) {
                console.error("Error in updatePassword:", err);
                return { success: false, message: "Something went wrong." };
            }
        },

        initiateResetPassword: async (
            _: unknown,
            args: { email: string },
        ): Promise<{ success: boolean; message: string }> => {
            const { email } = args;
            if (!email) throw new Error("Email is required.");

            const otp = otpGenerator();

            await OTPModel.findOneAndUpdate(
                { verificationIdentifier: email },
                { otp, createdAt: new Date() },
                { upsert: true, new: true }
            );

            await sendOtpEmail(email, otp, "Reset Password Verification OTP");

            return { success: true, message: "OTP sent to your registered email." };
        },


        resetPassword: async (
            _: unknown,
            args: { email: string; newPassword: string; reenterPassword: string },
        ): Promise<{ success: boolean; message: string }> => {
            const { email, newPassword, reenterPassword } = args;

            const otpStillThere = await OTPModel.findOne({ verificationIdentifier: email });
            if (otpStillThere) {
                return { success: false, message: "OTP verification required before resetting password." };
            }

            if (newPassword !== reenterPassword) {
                return { success: false, message: "Passwords do not match." };
            }

            const user = await userModel.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found." };
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            return { success: true, message: "Password has been reset successfully." };
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