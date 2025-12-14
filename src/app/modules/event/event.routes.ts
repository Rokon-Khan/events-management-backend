import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../helpers/fileUploader";
import auth from "../../middlewares/auth.middleware";
import { parseFormData } from "../../middlewares/parseFormData";
import validateRequest from "../../middlewares/validateRequest";
import { eventController } from "./event.controller";
import { eventValidation } from "./event.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.HOST),
  fileUploader.upload.single("eventImage"),
  parseFormData,
  validateRequest(eventValidation.createEvent),
  eventController.createEvent
);

router.get("/", eventController.getAllEvents);

router.get("/stats", auth(UserRole.ADMIN), eventController.getEventStats);

router.get("/upcoming", eventController.getUpcomingEvents);

router.get("/ongoing", eventController.getOngoingEvents);

router.get("/completed", eventController.getCompletedEvents);

router.get(
  "/my-participated-events",
  auth(UserRole.USER),
  eventController.getMyParticipatedEvents
);

router.get(
  "/my-created-events",
  auth(UserRole.HOST),
  eventController.getMyCreatedEvents
);

router.get(
  "/my-participated-events/:id",
  auth(UserRole.USER),
  eventController.getMyParticipatedEventById
);

router.get("/:id", eventController.getEventById);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.HOST),
  fileUploader.upload.single("eventImage"),
  parseFormData,
  validateRequest(eventValidation.updateEvent),
  eventController.updateEvent
);

router.delete("/:id", auth(UserRole.ADMIN), eventController.deleteEvent);

router.post(
  "/:id/participate",
  auth(UserRole.USER, UserRole.HOST),
  eventController.participateInEvent
);

export const eventRoutes = router;
