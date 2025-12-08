import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import logger from "../../utils/logger";

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-11-17.clover",
});

const createPayment = async (user: IAuthUser, payload: { eventId: string }) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User ID is required!");
  }

  const event = await prisma.event.findUnique({
    where: { id: payload.eventId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  if (event.joiningFee <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This event is free, no payment required!"
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      eventId: payload.eventId,
      paymentStatus: "COMPLETED",
    },
  });

  if (existingPayment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already paid for this event!"
    );
  }

  const transactionId = `TXN-${Date.now()}-${user.id.slice(-6)}`;

  const payment = await prisma.payment.create({
    data: {
      userId: user?.id,
      eventId: payload.eventId,
      amount: event.joiningFee,
      transactionId,
      paymentMethod: "STRIPE",
      paymentStatus: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          joiningFee: true,
          date: true,
          location: true,
        },
      },
    },
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.joiningFee * 100),
      currency: "usd",
      metadata: {
        paymentId: payment.id,
        transactionId,
        userId: user.id,
        eventId: payload.eventId,
        eventTitle: event.title,
      },
      description: `Payment for event: ${event.title}`,
      receipt_email: user?.email,
    });

    logger.info(
      `Payment intent created: ${paymentIntent.id} for user: ${user?.email}`
    );

    return {
      payment,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    };
  } catch (error: any) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: "FAILED" },
    });
    logger.error("Stripe payment intent creation failed:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create payment intent"
    );
  }
};

const getAllPayments = async (
  user: IAuthUser,
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = params;

  const andConditions: Prisma.PaymentWhereInput[] = [];

  if (user?.role === UserRole.HOST) {
    const hostEvents = await prisma.event.findMany({
      where: { userId: user?.id },
      select: { id: true },
    });
    const eventIds = hostEvents.map((e) => e.id);
    andConditions.push({ eventId: { in: eventIds } });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.PaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.payment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          joiningFee: true,
          date: true,
          location: true,
        },
      },
    },
  });

  const total = await prisma.payment.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getPaymentById = async (id: string, user: IAuthUser) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          joiningFee: true,
          date: true,
          location: true,
          userId: true,
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (user?.role === UserRole.HOST && payment.event.userId !== user?.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only view payments for your events!"
    );
  }

  if (user?.role === UserRole.USER && payment.userId !== user?.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only view your own payments!"
    );
  }

  return payment;
};

const updatePaymentStatus = async (id: string, payload: any) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: { paymentStatus: payload.paymentStatus },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          joiningFee: true,
        },
      },
    },
  });

  logger.info(`Payment status updated: ${id} to ${payload.paymentStatus}`);

  return updatedPayment;
};

const deletePayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  await prisma.payment.delete({
    where: { id },
  });

  logger.info(`Payment deleted: ${id}`);

  return { message: "Payment deleted successfully!" };
};

const handleStripeWebhook = async (event: Stripe.Event) => {
  logger.info(`Stripe webhook received: ${event.type}`);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentId = paymentIntent.metadata?.paymentId;

    if (!paymentId) {
      logger.error("Payment ID not found in webhook metadata");
      return { message: "Payment ID not found" };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { event: true },
    });

    if (!payment) {
      logger.error(`Payment not found: ${paymentId}`);
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { paymentStatus: "COMPLETED" },
      });

      await tx.event.update({
        where: { id: payment.eventId },
        data: { currentParticipants: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: payment.userId },
        data: { pertcipatedEvents: { increment: 1 } },
      });

      if (
        payment.event.currentParticipants + 1 >=
        payment.event.maxParticipants
      ) {
        await tx.event.update({
          where: { id: payment.eventId },
          data: { status: "FULL" },
        });
      }
    });

    logger.info(
      `Payment completed: ${paymentId}, user joined event: ${payment.eventId}`
    );

    return { message: "Payment successful and user added to event!" };
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentId = paymentIntent.metadata?.paymentId;

    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { paymentStatus: "FAILED" },
      });

      logger.warn(`Payment failed: ${paymentId}`);
    }

    return { message: "Payment failed!" };
  }

  return { message: "Webhook event processed" };
};

const verifyPayment = async (paymentIntentId: string, user: IAuthUser) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentIntent.metadata?.transactionId,
        userId: user?.id,
      },
      include: {
        event: true,
      },
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
    }

    if (
      paymentIntent.status === "succeeded" &&
      payment.paymentStatus !== "COMPLETED"
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: "COMPLETED" },
        });

        await tx.event.update({
          where: { id: payment.eventId },
          data: { currentParticipants: { increment: 1 } },
        });

        await tx.user.update({
          where: { id: payment.userId },
          data: { pertcipatedEvents: { increment: 1 } },
        });

        if (
          payment.event.currentParticipants + 1 >=
          payment.event.maxParticipants
        ) {
          await tx.event.update({
            where: { id: payment.eventId },
            data: { status: "FULL" },
          });
        }
      });

      logger.info(`Payment verified and completed: ${payment.id}`);
    }

    return {
      paymentStatus: paymentIntent.status,
      payment,
    };
  } catch (error: any) {
    logger.error("Payment verification failed:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to verify payment"
    );
  }
};

export const PaymentService = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  handleStripeWebhook,
  verifyPayment,
};
