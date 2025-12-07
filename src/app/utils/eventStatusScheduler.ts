import { EventStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import logger from "./logger";

export const updateExpiredEvents = async () => {
  try {
    const now = new Date();

    const result = await prisma.event.updateMany({
      where: {
        date: { lt: now },
        status: {
          in: [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.UPCOMING],
        },
      },
      data: { status: EventStatus.CLOSED },
    });

    if (result.count > 0) {
      logger.info(`Event statuses updated: ${result.count} events closed`);
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
