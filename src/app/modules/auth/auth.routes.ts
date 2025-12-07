import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/registration",
  validateRequest(AuthValidation.registration),
  AuthController.registration
);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmail),
  AuthController.verifyEmail
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginUser),
  AuthController.loginUser
);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.HOST),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPassword),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPassword),
  AuthController.resetPassword
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOTP),
  AuthController.resendOTP
);

router.get("/me", AuthController.getMe);

router.post(
  "/logout",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.HOST),
  AuthController.logout
);

export const AuthRoutes = router;
