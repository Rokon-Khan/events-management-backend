import { createTransport } from "./nodemailer.config";

const transporter = createTransport();

export async function sendEmailVerification(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify your email - EventHub Management",
    text: `Your one-time verification code is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #7f00ff; margin-bottom: 20px;">EventHub Management</h1>
          <p style="font-size: 16px; color: #333;">Your one-time verification code:</p>
          <h2 style="font-size: 32px; color: #000; letter-spacing: 2px; margin: 15px 0;">${otp}</h2>
          <p style="font-size: 14px; color: #555;">This code expires after <b>5 minutes</b>.  
          If you did not request this, please ignore this email or reset your password immediately.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">© 2025 EventHub Management. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Password Reset OTP - EventHub Management",
    text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #7f00ff; margin-bottom: 20px;">EventHub Management</h1>
          <p style="font-size: 16px; color: #333;">Your password reset code:</p>
          <h2 style="font-size: 32px; color: #000; letter-spacing: 2px; margin: 15px 0;">${otp}</h2>
          <p style="font-size: 14px; color: #555;">This code expires after <b>5 minutes</b>.  
          If you did not request this, please secure your account immediately.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">© 2025 EventHub Management. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}
