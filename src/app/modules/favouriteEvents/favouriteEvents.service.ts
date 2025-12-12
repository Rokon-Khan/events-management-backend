import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";

const prisma = new PrismaClient();

const addToFavourites = async (user: IAuthUser, eventId: string) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required!");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  const existingFavourite = await prisma.favouriteEvents.findFirst({
    where: {
      userId: user.id,
      eventId,
    },
  });

  if (existingFavourite) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Event already in favourites!");
  }

  const favourite = await prisma.favouriteEvents.create({
    data: {
      userId: user.id,
      eventId,
    },
    include: {
      event: {
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
      },
    },
  });

  return favourite;
};

const getMyFavourites = async (
  user: IAuthUser,
  options: IPaginationOptions
) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required!");
  }

  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.favouriteEvents.findMany({
    where: { userId: user.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      event: {
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
      },
    },
  });

  const total = await prisma.favouriteEvents.count({
    where: { userId: user.id },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const removeFromFavourites = async (user: IAuthUser, eventId: string) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required!");
  }

  const favourite = await prisma.favouriteEvents.findFirst({
    where: {
      userId: user.id,
      eventId,
    },
  });

  if (!favourite) {
    throw new ApiError(httpStatus.NOT_FOUND, "Favourite not found!");
  }

  await prisma.favouriteEvents.delete({
    where: { id: favourite.id },
  });

  return { message: "Event removed from favourites successfully!" };
};

export const favouriteEventsService = {
  addToFavourites,
  getMyFavourites,
  removeFromFavourites,
};
