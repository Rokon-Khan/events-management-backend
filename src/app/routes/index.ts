import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { eventRoutes } from "../modules/event/event.routes";
import { PaymentRoutes } from "../modules/payments/payment.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/event",
    route: eventRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
