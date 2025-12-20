import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendMail = async (
    to: string,
    subject: string,
    html: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });

        const info = await transporter.sendMail({
            from: "nexkart.nexkart@gmail.com",
            to,
            subject,
            html,
        });

        console.log("Email sent via Brevo:", info.messageId);
    } catch (err) {
        console.error("Brevo email failed:", err);
        // ❗ DO NOT throw — OTP must still work
    }
};
