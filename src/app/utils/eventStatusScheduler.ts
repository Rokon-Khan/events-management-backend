import { EventStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateExpiredEvents = async () => {
  try {
    const now = new Date();
    
    await prisma.event.updateMany({
      where: {
        date: { lt: now },
        status: { in: [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.UPCOMING] },
      },
      data: { status: EventStatus.CLOSED },
    });
    
    console.log("Event statuses updated successfully");
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
};

export const startEventStatusScheduler = () => {
  setInterval(updateExpiredEvents, 60000);
  updateExpiredEvents();
};
