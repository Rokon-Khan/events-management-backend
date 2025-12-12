// import { EventStatus, PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// import logger from "./logger";

// export const updateExpiredEvents = async () => {
//   try {
//     const now = new Date();
//     const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

//     const events = await prisma.event.findMany({
//       where: {
//         status: {
//           in: [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.UPCOMING, EventStatus.FULL],
//         },
//       },
//     });

//     let updatedCount = 0;

//     for (const event of events) {
//       let newStatus = event.status;

//       if (event.date < now) {
//         newStatus = event.currentParticipants >= event.minParticipants
//           ? EventStatus.COMPLETED
//           : EventStatus.CANCELLED;
//       } else if (event.currentParticipants >= event.maxParticipants) {
//         newStatus = EventStatus.FULL;
//       } else if (event.joiningFee === 0) {
//         newStatus = EventStatus.OPEN;
//       } else if (event.date > oneWeekFromNow) {
//         newStatus = EventStatus.UPCOMING;
//       } else {
//         newStatus = EventStatus.ONGOING;
//       }

//       if (newStatus !== event.status) {
//         await prisma.event.update({
//           where: { id: event.id },
//           data: { status: newStatus },
//         });
//         updatedCount++;
//       }
//     }

//     if (updatedCount > 0) {
//       logger.info(`Event statuses updated: ${updatedCount} events`);
//     }
//   } catch (error: any) {
//     logger.error("Error updating event statuses:", error);
//   }
// };

// export const startEventStatusScheduler = () => {
//   logger.info("Event status scheduler started (runs every 60 seconds)");
//   setInterval(updateExpiredEvents, 60000);
//   updateExpiredEvents();
// };

import { EventStatus, PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

/**
 * Normalize event date by setting its time to END OF DAY (23:59:59.999)
 */
const getEndOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Determine next status for an event
 */
const determineStatus = (event: any, now: Date, oneWeekFromNow: Date) => {
  const eventEnd = getEndOfDay(event.date);

  // 1️⃣ Event is in the past → COMPLETE or CANCEL
  if (eventEnd < now) {
    return event.currentParticipants >= event.minParticipants
      ? EventStatus.COMPLETED
      : EventStatus.CANCELLED;
  }

  // 2️⃣ Event is FULL
  if (event.currentParticipants >= event.maxParticipants) {
    return EventStatus.FULL;
  }

  // 3️⃣ Free events always remain OPEN before start
  if (event.joiningFee === 0) {
    return EventStatus.OPEN;
  }

  // 4️⃣ Event is far (more than 1 week) → UPCOMING
  if (event.date > oneWeekFromNow) {
    return EventStatus.UPCOMING;
  }

  // 5️⃣ Event is near (within 7 days) → ONGOING
  return EventStatus.ONGOING;
};

/**
 * Scheduler logic
 */
export const updateExpiredEvents = async () => {
  try {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch only events that can change status
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: [
            EventStatus.OPEN,
            EventStatus.ONGOING,
            EventStatus.UPCOMING,
            EventStatus.FULL,
          ],
        },
      },
    });

    const updates = [];

    for (const event of events) {
      const newStatus = determineStatus(event, now, oneWeekFromNow);

      if (newStatus !== event.status) {
        updates.push({
          id: event.id,
          status: newStatus,
        });
      }
    }

    // Bulk update (MUCH faster than updating inside loop)
    for (const item of updates) {
      await prisma.event.update({
        where: { id: item.id },
        data: { status: item.status },
      });
    }

    if (updates.length > 0) {
      logger.info(`Event statuses updated: ${updates.length} events`);
    }
  } catch (error: any) {
    logger.error("Error updating event statuses:", error);
  }
};

/**
 * Start scheduler
 */
export const startEventStatusScheduler = () => {
  logger.info("Event status scheduler started (runs every 60 seconds)");
  updateExpiredEvents();
  setInterval(updateExpiredEvents, 60000);
};
