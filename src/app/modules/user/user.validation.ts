import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updateProfile = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"]),
  }),
});

export const userValidation = {
  updateProfile,
  updateStatus,
};
