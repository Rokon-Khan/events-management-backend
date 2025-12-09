import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import { reportsController } from "./reports.controller";

const router = express.Router();

router.get(
  "/admin/dashboard",
  auth(UserRole.ADMIN),
  reportsController.getAdminDashboardStats
);

router.get(
  "/host/stats",
  auth(UserRole.HOST, UserRole.ADMIN),
  reportsController.getHostStats
);

router.get(
  "/user/stats",
  auth(UserRole.USER, UserRole.ADMIN),
  reportsController.getUserStats
);

router.get("/host/public-stats", reportsController.getHostStatsPublic);

router.get(
  "/payments/stats",
  auth(UserRole.ADMIN),
  reportsController.getPaymentStats
);

export const reportsRoutes = router;
