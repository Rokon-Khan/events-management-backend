export interface IPaymentInit {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod?: 'stripe' | 'sslcommerz';
}

export interface IPaymentCallback {
  transactionId: string;
  amount: string;
  status: 'success' | 'fail' | 'cancel';
}

export interface IStripePaymentIntent {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface IStripeCheckoutSession {
  bookingId: string;
  amount: number;
  currency?: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}