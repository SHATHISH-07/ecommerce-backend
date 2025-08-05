import { sendMail } from "../services/emailService";

export const sendOtpEmail = async (email: string, otp: string, message: string) => {
  const subject = `${message}`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${message}</h2>
      <p>Your OTP code is:</p>
      <h3 style="color: #0e76a8; font-weight: semibold">${otp}</h3>
      <p>This OTP will expire in 2 minutes.</p>
      <h2>Thank you for using our service! NexKart</h2>
    </div>
  `;

  await sendMail(email, subject, html);
};

export const sendSignupSuccessEmail = async (email: string, name: string, username: string) => {
  const subject = "Account Created Successfully, Welcome to NexKart";
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hi ${name}</h2>
      <h1>Welcome to NexKart!</h1>
      <p> Your account has been successfully created.</p>
      <p>Your username is: ${username}</p>
      <h2>Thank you for using our service! NexKart</h2>
    </div>
  `;

  await sendMail(email, subject, html);
}