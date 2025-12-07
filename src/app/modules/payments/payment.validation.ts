import { z } from "zod";

const createPayment = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const updatePaymentStatus = z.object({
  body: z.object({
    paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
  }),
});

export const PaymentValidation = {
  createPayment,
  updatePaymentStatus,
};
