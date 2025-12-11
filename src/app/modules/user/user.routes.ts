import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../helpers/fileUploader";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), userController.getAllFromDB);

router.get("/hosts", auth(UserRole.ADMIN), userController.getAllHosts);

router.get("/users", auth(UserRole.ADMIN), userController.getAllUsers);

router.get("/public-profile/:id", userController.getPublicProfile);

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
  (req, res, next) => {
    if (req.body.interests && typeof req.body.interests === "string") {
      try {
        req.body.interests = JSON.parse(req.body.interests);
      } catch (e) {
        req.body.interests = req.body.interests.split(",").map((item: string) => item.trim());
      }
    }
    next();
  },
  validateRequest(userValidation.updateProfile),
  userController.updateMyProfile
);

export const userRoutes = router;
