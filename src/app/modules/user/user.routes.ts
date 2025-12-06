import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../helpers/fileUploader";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), userController.getAllFromDB);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.HOST),
  userController.getMyProfile
);

router.get("/:id", auth(UserRole.ADMIN), userController.getUserById);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(userValidation.updateStatus),
  userController.changeProfileStatus
);

router.patch(
  "/update-my-profile",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.HOST),
  fileUploader.upload.single("profilePhoto"),
  validateRequest(userValidation.updateProfile),
  userController.updateMyProfile
);

export const userRoutes = router;
