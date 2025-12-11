import { EventStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import logger from "./logger";

export const updateExpiredEvents = async () => {
  try {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await prisma.event.findMany({
      where: {
        status: {
          in: [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.UPCOMING, EventStatus.FULL],
        },
      },
    });

    let updatedCount = 0;

    for (const event of events) {
      let newStatus = event.status;

      if (event.date < now) {
        newStatus = event.currentParticipants >= event.minParticipants 
          ? EventStatus.COMPLETED 
          : EventStatus.CANCELLED;
      } else if (event.currentParticipants >= event.maxParticipants) {
        newStatus = EventStatus.FULL;
      } else if (event.joiningFee === 0) {
        newStatus = EventStatus.OPEN;
      } else if (event.date > oneWeekFromNow) {
        newStatus = EventStatus.UPCOMING;
      } else {
        newStatus = EventStatus.ONGOING;
      }

      if (newStatus !== event.status) {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: newStatus },
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      logger.info(`Event statuses updated: ${updatedCount} events`);
    }
  } catch (error: any) {
    logger.error("Error updating event statuses:", error);
  }
};

export const startEventStatusScheduler = () => {
  logger.info("Event status scheduler started (runs every 60 seconds)");
  setInterval(updateExpiredEvents, 60000);
  updateExpiredEvents();
};
