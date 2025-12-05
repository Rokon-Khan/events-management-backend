import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initiatePayment(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully!",
    data: result,
  });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.handlePaymentCallback({
    transactionId: req.query.transactionId as string,
    amount: req.query.amount as string,
    status: "success",
  });

  res.redirect(
    `${process.env.CLIENT_URL}/payment/success?transactionId=${req.query.transactionId}`
  );
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.handlePaymentCallback({
    transactionId: req.query.transactionId as string,
    amount: req.query.amount as string,
    status: "fail",
  });

  res.redirect(
    `${process.env.CLIENT_URL}/payment/failed?transactionId=${req.query.transactionId}`
  );
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.handlePaymentCallback({
    transactionId: req.query.transactionId as string,
    amount: req.query.amount as string,
    status: "cancel",
  });

  res.redirect(
    `${process.env.CLIENT_URL}/payment/cancelled?transactionId=${req.query.transactionId}`
  );
});

const createStripePaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createStripePaymentIntent(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe payment intent created successfully!",
    data: result,
  });
});

const createStripeCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createStripeCheckoutSession(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe checkout session created successfully!",
    data: result,
  });
});

const stripeSuccess = catchAsync(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  const result = await PaymentService.handleStripeWebhook(sessionId);

  res.redirect(
    `${process.env.CLIENT_URL}/payment/success?sessionId=${sessionId}`
  );
});

const stripeCancel = catchAsync(async (req: Request, res: Response) => {
  const transactionId = req.query.transaction_id as string;
  
  res.redirect(
    `${process.env.CLIENT_URL}/payment/cancelled?transactionId=${transactionId}`
  );
});

export const PaymentController = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  createStripePaymentIntent,
  createStripeCheckoutSession,
  stripeSuccess,
  stripeCancel,
};
