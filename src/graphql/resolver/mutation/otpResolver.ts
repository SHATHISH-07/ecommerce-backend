import OTPModel from "../../../models/OTPModel";
import PendingUserModel from "../../../models/pendingUserModel";
import UserModel from "../../../models/userModel";
import { MyContext, ResendOTPResponse, UserModelWithoutPassword } from "../../../types";
import otpGenerator from "../../../utils/otpGenerator";
import { sendOtpEmail, sendSignupSuccessEmail } from "../../../utils/sendEmail";

const otpResolver = {
    Mutation: {
        verifyEmailOtp: async (
            _: unknown,
            args: { email: string; otp: string }
        ): Promise<Partial<UserModelWithoutPassword>> => {
            const { email, otp } = args;

            const savedOtp = await OTPModel.findOne({ email: email });
            if (!savedOtp) throw new Error("OTP expired or not found");

            const now = new Date();
            const diffMs = now.getTime() - savedOtp.createdAt.getTime();
            if (diffMs > 2 * 60 * 1000) {
                await OTPModel.deleteOne({ email });
                throw new Error("OTP has expired. Please request a new one.");
            }

            const isMatch = await savedOtp.compareOTP(otp);
            if (!isMatch) throw new Error("Invalid OTP");

            const pendingUser = await PendingUserModel.findOne({ email });
            if (!pendingUser) throw new Error("Pending user not found");

            const {
                name,
                username,
                address,
                phone,
                password,
                role,
                city,
                state,
                zipCode,
                country,
            } = pendingUser;

            const newUser = new UserModel({
                name,
                username,
                email,
                address,
                phone,
                role,
                password,
                city,
                state,
                zipCode,
                country,
                emailVerified: true,
            });

            const savedUser = await newUser.save();

            sendSignupSuccessEmail(savedUser.email, savedUser.name, savedUser.username).catch(console.error);

            await Promise.all([
                OTPModel.deleteOne({ email }),
                PendingUserModel.deleteOne({ email })
            ]);


            return {
                userId: savedUser.id,
                name: savedUser.name,
                username: savedUser.username,
                email: savedUser.email,
                address: savedUser.address,
                phone: savedUser.phone,
                city: savedUser.city,
                state: savedUser.state,
                zipCode: savedUser.zipCode,
                userOrderHistory: savedUser.userOrderHistory,
                country: savedUser.country,
                isActive: savedUser.isActive,
                isBanned: savedUser.isBanned,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
                updatedBy: savedUser.updatedBy,
                role: savedUser.role,
            };
        },

        verifyResetPasswordOtp: async (
            _: unknown,
            args: { email: string; otp: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const { email, otp } = args

            const otpDoc = await OTPModel.findOne({ email });
            if (!otpDoc) {
                return {
                    success: false,
                    message: "OTP has expired or not requested.",
                };
            }

            const isMatch = await otpDoc.compareOTP(otp);
            if (!isMatch) {
                return {
                    success: false,
                    message: "Invalid OTP.",
                };
            }

            await OTPModel.deleteOne({ email });

            return {
                success: true,
                message: "OTP verified. You can now reset your password.",
            };
        },



        resendEmailOTP: async (
            _: unknown,
            args: { email: string }
        ): Promise<ResendOTPResponse> => {
            const { email } = args;

            const pendingUser = await PendingUserModel.findOne({ email });
            if (!pendingUser) {
                throw new Error("Pending user not found for the given email");
            }

            const existingOtp = await OTPModel.findOne({ email });
            if (
                existingOtp &&
                existingOtp.createdAt &&
                Date.now() - existingOtp.createdAt.getTime() < 60000
            ) {
                throw new Error("Please wait at least 1 minute before requesting a new OTP");
            }

            const otp = otpGenerator();

            const message = "Resented OTP to your registered email";

            let otpDoc = await OTPModel.findOne({ email });
            if (!otpDoc) {
                otpDoc = new OTPModel({ email, otp });
            } else {
                otpDoc.otp = otp;
            }

            await otpDoc.save();
            await sendOtpEmail(email, otp, message);

            return {
                success: true,
                message: "OTP resent successfully",
            };
        }

    },
};

export default otpResolver;
