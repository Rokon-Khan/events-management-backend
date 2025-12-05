import { z } from "zod";

const initiatePayment = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    amount: z.number().positive("Amount must be positive"),
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z.string().email("Invalid email format"),
    customerPhone: z.string().min(1, "Customer phone is required"),
    customerAddress: z.string().min(1, "Customer address is required"),
    paymentMethod: z.enum(["stripe", "sslcommerz"]).optional(),
  }),
});

const stripePaymentIntent = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().optional(),
  }),
});

const stripeCheckoutSession = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().optional(),
    productName: z.string().min(1, "Product name is required"),
    successUrl: z.string().url("Invalid success URL"),
    cancelUrl: z.string().url("Invalid cancel URL"),
  }),
});

export const PaymentValidation = {
  initiatePayment,
  stripePaymentIntent,
  stripeCheckoutSession,
};
