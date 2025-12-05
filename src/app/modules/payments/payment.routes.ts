import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/initiate",
  auth(UserRole.TRAVELLER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest(PaymentValidation.initiatePayment),
  PaymentController.initiatePayment
);

// Stripe Payment Routes
router.post(
  "/stripe/payment-intent",
  auth(UserRole.TRAVELLER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest(PaymentValidation.stripePaymentIntent),
  PaymentController.createStripePaymentIntent
);

router.post(
  "/stripe/checkout-session",
  auth(UserRole.TRAVELLER, UserRole.AGENT, UserRole.ADMIN),
  validateRequest(PaymentValidation.stripeCheckoutSession),
  PaymentController.createStripeCheckoutSession
);

router.get("/stripe/success", PaymentController.stripeSuccess);
router.get("/stripe/cancel", PaymentController.stripeCancel);

// SSL Commerz Routes
router.get("/success", PaymentController.paymentSuccess);
router.get("/fail", PaymentController.paymentFail);
router.get("/cancel", PaymentController.paymentCancel);

export const PaymentRoutes = router;
