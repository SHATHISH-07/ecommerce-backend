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

export const sendOrderSuccessEmail = async (name: string, phone: string, email: string, order: string, message: string) => {
  const subject = "Order Placed Successfully";
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>${name}</h1>
      <p>Order ID: ${order}</p>
      <p>Phone: ${phone}</p>
      <h2>${message}</h2>
      <p>Your order has been successfully placed. We will deliver it to you soon.</p>
      <p>Thanks for shopping with us!</p>
      <h2>Thank you for using our service! NexKart</h2>
    </div>
  `;

  await sendMail(email, subject, html);
}

export const sendOrderStatusEmail = async (name: string, email: string, orderId: string, date: number, message: string) => {
  const subject = "Order Status Updated";
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>${name}</h1>
      <p>Order ID: ${orderId}</p>
      <p>Date: ${date}</p>
      <h2>${message}</h2>
      <p></p>
      <h2>Thank you for using our service! NexKart</h2>
    </div>
  `;

  await sendMail(email, subject, html);
}

export const sendEmailNoReturnPolicy = async (name: string, email: string, message: string) => {
  const subject = "Return Policy";
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>${name}</h1>
      <h2>${message}</h2>
      <h2>Thank you for using our service! NexKart</h2>
    </div>
  `;

  await sendMail(email, subject, html);
}