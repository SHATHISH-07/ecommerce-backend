import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

export default async function sendOtpSms(to: string, otp: string): Promise<boolean> {
    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to,
        });
        console.log("Message sent:", message.sid);
        return true;
    } catch (error) {
        console.error("Failed to send SMS:", error);
        return false;
    }
}

