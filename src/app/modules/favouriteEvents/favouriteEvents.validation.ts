import { z } from "zod";

const addToFavourites = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

export const favouriteEventsValidation = {
  addToFavourites,
};