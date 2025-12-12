import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { favouriteEventsController } from "./favouriteEvents.controller";
import { favouriteEventsValidation } from "./favouriteEvents.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  validateRequest(favouriteEventsValidation.addToFavourites),
  favouriteEventsController.addToFavourites
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  favouriteEventsController.getMyFavourites
);

router.delete(
  "/:eventId",
  auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
  favouriteEventsController.removeFromFavourites
);

export const favouriteEventsRoutes = router;