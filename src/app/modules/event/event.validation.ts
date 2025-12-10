import { z } from "zod";

const createEvent = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    eventCategory: z.string().min(1, "Event category is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(1, "Location is required"),
    minParticipants: z
      .string()
      .or(z.number())
      .transform((val) => Number(val)),
    maxParticipants: z
      .string()
      .or(z.number())
      .transform((val) => Number(val)),
    joiningFee: z
      .string()
      .or(z.number())
      .transform((val) => Number(val))
      .optional(),
  }),
});

const updateEvent = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    eventCategory: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    minParticipants: z
      .string()
      .or(z.number())
      .transform((val) => Number(val))
      .optional(),
    maxParticipants: z
      .string()
      .or(z.number())
      .transform((val) => Number(val))
      .optional(),
    joiningFee: z
      .string()
      .or(z.number())
      .transform((val) => Number(val))
      .optional(),
    status: z
      .enum([
        "OPEN",
        "FULL",
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "CLOSED",
        "PENDING",
      ])
      .optional(),
  }),
});

export const eventValidation = {
  createEvent,
  updateEvent,
};
