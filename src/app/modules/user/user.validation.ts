import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updateProfile = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.string().optional(),
});

const updateStatus = z.object({
  status: z.enum([
    UserStatus.ACTIVE,
    UserStatus.INACTIVE,
    UserStatus.BLOCKED,
    UserStatus.DELETED,
  ]),
});

export const userValidation = {
  updateProfile,
  updateStatus,
};
