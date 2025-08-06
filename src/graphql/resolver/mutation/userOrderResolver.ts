import PendingOrderModel from "../../../models/pendingOrderModel";
import OTPModel from "../../../models/OTPModel";
import { MyContext, userOrderInput } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import otpGenerator from "../../../utils/otpGenerator";
import { sendOtpEmail } from "../../../utils/sendEmail";


const userOrderResolver = {
    Mutation: {
        placeOrder: async (
            _: unknown,
            args: { input: userOrderInput },
            context: MyContext
        ): Promise<{ message: string; success: boolean }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("Not authenticated, user must be logged in.");
            }

            const userId = currentUser.userId;

            const {

                products,
                totalAmount,
                paymentMethod,
                shippingAddress,
            } = args.input;

            if (!products?.length || !totalAmount || !paymentMethod || !shippingAddress) {
                throw new Error("All fields are required.");
            }

            if (!shippingAddress.phone || shippingAddress.phone.trim() === "") {
                throw new Error("Phone number is required.");
            }

            const newOrder = await PendingOrderModel.create({
                userId,
                products,
                totalAmount,
                paymentMethod,
                shippingAddress,

            });

            // Disabled due to trail account restrictions
            // const smsPhone = shippingAddress.phone.startsWith("+91")
            //     ? shippingAddress.phone
            //     : `+91${shippingAddress.phone}`;

            // const otp = otpGenerator();

            // const smsSent = await sendOtpSms(smsPhone, otp);


            const otp = otpGenerator();

            await sendOtpEmail(
                shippingAddress.email,
                otp,
                "Place order verification OTP"
            )

            const newOtpEntry = new OTPModel({
                verificationIdentifier: shippingAddress.email,
                otp,
            });
            await newOtpEntry.save();

            return {
                message: "OTP sent to your email. Please verify to place the order.",
                success: true,
            };
        },
    },
};

export default userOrderResolver;
