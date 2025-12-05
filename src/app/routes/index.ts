import express from "express";
// import { AuthRoutes } from "../modules/aut/auth.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
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
    path: "/payments",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
