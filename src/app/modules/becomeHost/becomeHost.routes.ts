import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { becomeHostController } from "./becomeHost.controller";
import { becomeHostValidation } from "./becomeHost.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER),
  validateRequest(becomeHostValidation.createBecomeHost),
  becomeHostController.createBecomeHostRequest
);

router.post(
  "/admin/create",
  auth(UserRole.ADMIN),
  validateRequest(becomeHostValidation.createBecomeHostByAdmin),
  becomeHostController.createBecomeHostByAdmin
);

router.get(
  "/",
  auth(UserRole.ADMIN),
  becomeHostController.getAllBecomeHostRequests
);

router.get(
  "/:id",
  auth(UserRole.ADMIN),
  becomeHostController.getBecomeHostById
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(becomeHostValidation.updateBecomeHost),
  becomeHostController.updateBecomeHostRequest
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  becomeHostController.deleteBecomeHostRequest
);

export const becomeHostRoutes = router;
