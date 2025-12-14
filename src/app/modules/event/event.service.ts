import { EventStatus, Prisma, PrismaClient, UserRole } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { fileUploader } from "../../helpers/fileUploader";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { eventSearchableFields } from "./event.constant";

const prisma = new PrismaClient();

const createEvent = async (user: IAuthUser, req: Request) => {
  if (!user) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User authentication required!"
    );
  }

  const file = req.file;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Event image is required!");
  }

  const uploaded = await fileUploader.uploadToCloudinary(file);
  const eventImage = (uploaded as any)?.secure_url;

  const eventData = {
    ...req.body,
    eventImage,
    userId: user.id,
    date: new Date(req.body.date),
  };

  const event = await prisma.event.create({
    data: eventData,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { hostedEvents: { increment: 1 } },
  });

  return event;
};

const getAllEvents = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.EventWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.event.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  const total = await prisma.event.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  return event;
};

const updateEvent = async (id: string, user: IAuthUser, req: Request) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  if (user?.role !== UserRole.ADMIN && event.userId !== user?.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this event!"
    );
  }

  const file = req.file;
  let eventImage = event.eventImage;

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file, eventImage);
    eventImage = (uploaded as any)?.secure_url;
  }

  const updateData: any = { ...req.body };
  if (eventImage) updateData.eventImage = eventImage;
  if (req.body.date) updateData.date = new Date(req.body.date);

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return updatedEvent;
};

const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  await prisma.event.delete({
    where: { id },
  });

  await prisma.user.update({
    where: { id: event.userId },
    data: { hostedEvents: { decrement: 1 } },
  });

  return { message: "Event deleted successfully!" };
};

const participateInEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  if (event.joiningFee > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This event requires payment. Please use the payment endpoint."
    );
  }

  if (
    !([EventStatus.OPEN, EventStatus.ONGOING] as EventStatus[]).includes(
      event.status
    )
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot participate in this event!"
    );
  }

  if (event.currentParticipants >= event.maxParticipants) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: EventStatus.FULL },
    });
    throw new ApiError(httpStatus.BAD_REQUEST, "Event is full!");
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      currentParticipants: { increment: 1 },
      status:
        event.currentParticipants + 1 >= event.maxParticipants
          ? EventStatus.FULL
          : event.status,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { pertcipatedEvents: { increment: 1 } },
  });

  return updatedEvent;
};

const getEventsByStatus = async (
  status: EventStatus,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.event.findMany({
    where: { status },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  const total = await prisma.event.count({ where: { status } });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getEventStats = async () => {
  const totalEvents = await prisma.event.count();
  const totalOpenEvents = await prisma.event.count({
    where: { status: EventStatus.OPEN },
  });
  const totalFullEvents = await prisma.event.count({
    where: { status: EventStatus.FULL },
  });
  const totalCompletedEvents = await prisma.event.count({
    where: { status: EventStatus.COMPLETED },
  });
  const totalUpcomingEvents = await prisma.event.count({
    where: { status: EventStatus.UPCOMING },
  });
  const totalOngoingEvents = await prisma.event.count({
    where: { status: EventStatus.ONGOING },
  });

  return {
    totalEvents,
    totalOpenEvents,
    totalFullEvents,
    totalCompletedEvents,
    totalUpcomingEvents,
    totalOngoingEvents,
  };
};

const getMyParticipatedEvents = async (
  userId: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.event.findMany({
    where: {
      payments: {
        some: {
          userId: userId,
          paymentStatus: "COMPLETED", // Optional but recommended
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.event.count({
    where: {
      payments: {
        some: {
          userId: userId,
          paymentStatus: "COMPLETED", // Optional but recommended
        },
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getMyParticipatedEventById = async (userId: string, eventId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      payments: {
        some: {
          userId: userId,
          paymentStatus: "COMPLETED",
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Event not found or you are not a participant!"
    );
  }

  return event;
};

const checkAndUpdateEventStatus = async () => {
  const now = new Date();

  await prisma.event.updateMany({
    where: {
      date: { lt: now },
      status: {
        in: [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.UPCOMING],
      },
    },
    data: { status: EventStatus.CLOSED },
  });
};

const getMyCreatedEvents = async (
  userId: string,
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.EventWhereInput[] = [{ userId }];
  if (searchTerm) {
    andConditions.push({
      OR: eventSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.EventWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.event.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });
  const total = await prisma.event.count({ where: whereConditions });
  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const eventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  participateInEvent,
  getEventsByStatus,
  getEventStats,
  getMyParticipatedEvents,
  getMyParticipatedEventById,
  checkAndUpdateEventStatus,
  getMyCreatedEvents,
};
