import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { StripeService } from "../stripe/stripe.service";

const prisma = new PrismaClient();

const createPayment = async (user: IAuthUser, payload: any) => {
  const event = await prisma.event.findUnique({
    where: { id: payload.eventId },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  const transactionId = `STRIPE-${Date.now()}-${user.id.slice(-6)}`;

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      eventId: payload.eventId,
      amount: event.joiningFee,
      transactionId,
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
        },
      },
    },
  });

  const paymentIntent = await StripeService.createPaymentIntent(
    event.joiningFee,
    "usd",
    {
      paymentId: payment.id,
      transactionId,
      userId: user?.id,
      eventId: payload.eventId,
    }
  );

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
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

  return { message: "Payment deleted successfully!" };
};

const handleStripeWebhook = async (paymentIntentId: string) => {
  const paymentIntent = await StripeService.retrievePaymentIntent(
    paymentIntentId
  );

  if (!paymentIntent.metadata?.paymentId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid payment intent metadata"
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentIntent.metadata.paymentId },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (paymentIntent.status === "succeeded") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: "COMPLETED" },
    });

    return { message: "Payment successful!" };
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: "FAILED" },
    });

    return { message: "Payment failed!" };
  }
};

export const PaymentService = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  handleStripeWebhook,
};
