import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PaymentService } from "./payment.service";

const createPayment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PaymentService.createPayment(req.user as IAuthUser, req.body);

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

    const result = await PaymentService.getAllPayments(req.user as IAuthUser, filters, options);

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
    const result = await PaymentService.getPaymentById(req.params.id, req.user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment retrieved successfully!",
      data: result,
    });
  }
);

const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.updatePaymentStatus(req.params.id, req.body);

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
  const paymentIntentId = req.body.data?.object?.id;
  const result = await PaymentService.handleStripeWebhook(paymentIntentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const PaymentController = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  stripeWebhook,
};
