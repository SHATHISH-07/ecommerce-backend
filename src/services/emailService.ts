import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.GMAIL_SENDER_EMAIL,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken.token || "",
            },
        });

        const mailOptions = {
            from: `"NexKart" <${process.env.GMAIL_SENDER_EMAIL}>`,
            to,
            subject,
            html,
            messageId: `<${randomUUID()}@nexkart.com>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Failed to send email");
    }
};
