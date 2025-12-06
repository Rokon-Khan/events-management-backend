import { PaymentStatus, PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { StripeService } from "../stripe/stripe.service";
import {
  IPaymentCallback,
  IPaymentInit,
  IStripeCheckoutSession,
  IStripePaymentIntent,
} from "./payment.interface";

const prisma = new PrismaClient();

const initiatePayment = async (payload: IPaymentInit) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { user: true },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.paymentStatus === PaymentStatus.COMPLETED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment already completed!");
  }

  const transactionId = `TXN-${Date.now()}-${booking.id.slice(-6)}`;
  const paymentMethod = payload.paymentMethod || "sslcommerz";

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: payload.bookingId,
      transactionId,
      amount: payload.amount,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: paymentMethod === "stripe" ? "Stripe" : "SSLCommerz",
    },
  });

  if (paymentMethod === "stripe") {
    // Use Stripe for payment
    const paymentIntent = await StripeService.createPaymentIntent(
      payload.amount,
      "usd",
      {
        bookingId: payload.bookingId,
        transactionId,
        customerEmail: payload.customerEmail,
      }
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId,
    };
  } else {
    // Use SSL Commerz for payment
    const sslPayload = {
      amount: payload.amount,
      transactionId,
      name: payload.customerName,
      email: payload.customerEmail,
      phoneNumber: payload.customerPhone,
      address: payload.customerAddress,
    };

    const paymentSession = await SSLService.sslPaymentInit(sslPayload);

    return {
      paymentUrl: paymentSession.GatewayPageURL,
      transactionId,
    };
  }
};

const handlePaymentCallback = async (payload: IPaymentCallback) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: payload.transactionId },
    include: { booking: true },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (payload.status === "success") {
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      });

      // Update booking
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: BookingStatus.CONFIRMED,
        },
      });
    });

    return { message: "Payment successful!", booking: payment.booking };
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    return { message: "Payment failed!" };
  }
};

const createStripePaymentIntent = async (payload: IStripePaymentIntent) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { user: true },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.paymentStatus === PaymentStatus.COMPLETED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment already completed!");
  }

  const transactionId = `STRIPE-${Date.now()}-${booking.id.slice(-6)}`;

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: payload.bookingId,
      transactionId,
      amount: payload.amount,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: "Stripe",
    },
  });

  const paymentIntent = await StripeService.createPaymentIntent(
    payload.amount,
    payload.currency || "usd",
    {
      bookingId: payload.bookingId,
      transactionId,
    }
  );

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    transactionId,
  };
};

const createStripeCheckoutSession = async (payload: IStripeCheckoutSession) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { user: true },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.paymentStatus === PaymentStatus.COMPLETED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment already completed!");
  }

  const transactionId = `STRIPE-CHECKOUT-${Date.now()}-${booking.id.slice(-6)}`;

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: payload.bookingId,
      transactionId,
      amount: payload.amount,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: "Stripe",
    },
  });

  const lineItems = [
    {
      price_data: {
        currency: payload.currency || "usd",
        product_data: {
          name: payload.productName,
        },
        unit_amount: Math.round(payload.amount * 100),
      },
      quantity: 1,
    },
  ];

  const session = await StripeService.createCheckoutSession(
    lineItems,
    `${payload.successUrl}?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionId}`,
    `${payload.cancelUrl}?transaction_id=${transactionId}`,
    {
      bookingId: payload.bookingId,
      transactionId,
    }
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    transactionId,
  };
};

const handleStripeWebhook = async (sessionId: string) => {
  const session = await StripeService.retrieveCheckoutSession(sessionId);

  if (!session.metadata?.transactionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid session metadata");
  }

  const payment = await prisma.payment.findUnique({
    where: { transactionId: session.metadata.transactionId },
    include: { booking: true },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (session.payment_status === "paid") {
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          gatewayResponse: session as any,
        },
      });

      // Update booking
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: BookingStatus.CONFIRMED,
        },
      });
    });

    return { message: "Payment successful!", booking: payment.booking };
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        gatewayResponse: session as any,
      },
    });

    return { message: "Payment failed!" };
  }
};

export const PaymentService = {
  initiatePayment,
  handlePaymentCallback,
  createStripePaymentIntent,
  createStripeCheckoutSession,
  handleStripeWebhook,
};
