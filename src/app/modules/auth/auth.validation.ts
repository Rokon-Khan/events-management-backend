import { z } from "zod";

const registration = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(32, "Full name is too long"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(24, "Password is too long"),
    role: z.enum(["USER", "HOST", "ADMIN"]).optional(),
  }),
});

const verifyEmail = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

const loginUser = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(24, "New password is too long"),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

const resetPassword = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

const resendOTP = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    purpose: z.enum(["email_verification", "password_reset"]),
  }),
});

export const AuthValidation = {
  registration,
  verifyEmail,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOTP,
};
