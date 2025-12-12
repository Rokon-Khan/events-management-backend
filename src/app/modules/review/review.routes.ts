import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  validateRequest(reviewValidation.createReview),
  reviewController.createReview
);

router.get("/", reviewController.getAllReviews);

router.get("/host/:hostId/stats", reviewController.getHostReviewStats);

router.get("/host-my-reviews", auth(UserRole.HOST), reviewController.getHostMyReviews);

router.get("/host-reviews/:eventId", reviewController.getHostReviewsByEventId);

router.get("/:id", reviewController.getReviewById);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  validateRequest(reviewValidation.updateReview),
  reviewController.updateReview
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  reviewController.deleteReview
);

export const reviewRoutes = router;
