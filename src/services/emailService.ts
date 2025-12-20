import axios from "axios";

export const sendMail = async (
    to: string,
    subject: string,
    html: string
) => {
    try {
        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "NexKart",
                    email: "nexkart.nexkart@gmail.com" // verified sender
                },
                to: [{ email: to }],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY!,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Email sent via Brevo API");
    } catch (err: any) {
        console.error("Brevo API email failed:", err.response?.data || err.message);
        // ❗ DO NOT throw
    }
};
