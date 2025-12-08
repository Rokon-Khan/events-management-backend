import { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../../config";
import { IAuthUser } from "../../interfaces/common";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import logger from "../../utils/logger";
import { PaymentService } from "./payment.service";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-11-17.clover",
});

const createPayment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PaymentService.createPayment(
      req.user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Payment initiated successfully!",
      data: result,
    });
  }
);

const getAllPayments = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filters = pick(req.query, ["eventId", "userId", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PaymentService.getAllPayments(
      req.user as IAuthUser,
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payments retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getPaymentById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PaymentService.getPaymentById(
      req.params.id,
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment retrieved successfully!",
      data: result,
    });
  }
);

const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.updatePaymentStatus(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated successfully!",
    data: result,
  });
});

const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.deletePayment(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment deleted successfully!",
    data: result,
  });
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    const result = await PaymentService.handleStripeWebhook(event);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (err: any) {
    logger.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const verifyPayment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { paymentIntentId } = req.body;
    const result = await PaymentService.verifyPayment(
      paymentIntentId,
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment verified successfully!",
      data: result,
    });
  }
);

export const PaymentController = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  stripeWebhook,
  verifyPayment,
};
