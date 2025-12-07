import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.HOST),
  validateRequest(PaymentValidation.createPayment),
  PaymentController.createPayment
);

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.HOST),
  PaymentController.getAllPayments
);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.HOST),
  PaymentController.getPaymentById
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(PaymentValidation.updatePaymentStatus),
  PaymentController.updatePaymentStatus
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  PaymentController.deletePayment
);

router.post("/stripe/webhook", PaymentController.stripeWebhook);

export const PaymentRoutes = router;
