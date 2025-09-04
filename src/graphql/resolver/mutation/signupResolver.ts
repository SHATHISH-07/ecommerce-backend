import bcrypt from "bcrypt";
import OTPModel from "../../../models/OTPModel";
import pendingUserModel from "../../../models/pendingUserModel";
import UserModel from "../../../models/userModel";
import otpGenerator from "../../../utils/otpGenerator";
import { sendOtpEmail } from "../../../utils/sendEmail";

const signupResolver = {
    Mutation: {
        signup: async (
            _: unknown,
            args: {
                input: {
                    name: string;
                    username: string;
                    email: string;
                    address: string;
                    phone: string;
                    country: string;
                    state: string;
                    role: string;
                    city: string;
                    zipCode: string;
                    emailVerified: boolean;
                    password: string;
                }
            }
        ): Promise<{ message: string; success: boolean }> => {

            const {
                name,
                username,
                email,
                address,
                phone,
                password,
                country,
                state,
                role,
                city,
                zipCode,
                emailVerified,
            } = args.input;

            if (email === "" || password === "") {
                throw new Error("Email and password are required");
            }

            if (email === "nexkart.nexkart@gmail.com") {
                throw new Error("Enter a valid email address");
            }

            const existingUser = await UserModel.findOne({
                $or: [{ username }, { email }]
            });

            const pendingUser = await pendingUserModel.findOne({ $or: [{ email }, { username }] });

            if (existingUser || pendingUser) {
                throw new Error("Email or Username already exists");
            }

            const newPendingUser = new pendingUserModel(args.input);
            await newPendingUser.save();

            const otp = otpGenerator();

            const verificationIdentifier = email

            const message = "Signup Verification OTP";

            const hashedOtp = await bcrypt.hash(otp, 10);

            await OTPModel.findOneAndUpdate(
                { verificationIdentifier },
                { otp: hashedOtp, createdAt: new Date() },
                { upsert: true, new: true }
            );


            await sendOtpEmail(email, otp, message);

            return {
                message: "OTP sent successfully",
                success: true
            }
        },
    },
};

export default signupResolver;
