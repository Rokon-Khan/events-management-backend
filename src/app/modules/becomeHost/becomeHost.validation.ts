import { z } from "zod";

const createBecomeHost = z.object({
  body: z.object({
    hostExperience: z
      .string()
      .min(1, "Host experience is required")
      .max(500, "Host experience must be at most 500 characters"),
    typeOfEvents: z
      .string()
      .min(1, "Type of events is required")
      .max(300, "Type of events must be at most 300 characters"),
    whyHost: z
      .string()
      .min(1, "Why host is required")
      .max(500, "Why host must be at most 500 characters"),
  }),
});

const createBecomeHostByAdmin = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    hostExperience: z
      .string()
      .min(1, "Host experience is required")
      .max(500, "Host experience must be at most 500 characters"),
    typeOfEvents: z
      .string()
      .min(1, "Type of events is required")
      .max(300, "Type of events must be at most 300 characters"),
    whyHost: z
      .string()
      .min(1, "Why host is required")
      .max(500, "Why host must be at most 500 characters"),
  }),
});

const updateBecomeHost = z.object({
  body: z.object({
    approveHost: z.boolean().optional(),
  }),
});

export const becomeHostValidation = {
  createBecomeHost,
  createBecomeHostByAdmin,
  updateBecomeHost,
};
