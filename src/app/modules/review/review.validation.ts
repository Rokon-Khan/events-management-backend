import { z } from "zod";

const createReview = z.object({
  body: z.object({
    rating: z.number().min(0, "Rating must be at least 0").max(5, "Rating must be at most 5"),
    comment: z.string().optional(),
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const updateReview = z.object({
  body: z.object({
    rating: z.number().min(0, "Rating must be at least 0").max(5, "Rating must be at most 5").optional(),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = {
  createReview,
  updateReview,
};
