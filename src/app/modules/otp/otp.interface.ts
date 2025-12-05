export interface OTPRecord {
  email: string;
  otp: string;
  purpose: "email_verification" | "password_reset";
  expiresAt: number;
}
