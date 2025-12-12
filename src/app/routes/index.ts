import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { becomeHostRoutes } from "../modules/becomeHost/becomeHost.routes";
import { eventRoutes } from "../modules/event/event.routes";
import { PaymentRoutes } from "../modules/payments/payment.routes";
import { reportsRoutes } from "../modules/reports/reports.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { userRoutes } from "../modules/user/user.routes";
import { favouriteEventsRoutes } from "../modules/favouriteEvents/favouriteEvents.routes";

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
    path: "/review",
    route: reviewRoutes,
  },
  {
    path: "/become-host",
    route: becomeHostRoutes,
  },
  {
    path: "/reports",
    route: reportsRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/favourite-events",
    route: favouriteEventsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
