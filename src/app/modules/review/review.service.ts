import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";

const prisma = new PrismaClient();

const createReview = async (user: IAuthUser, payload: any) => {
  const event = await prisma.event.findUnique({
    where: { id: payload.eventId },
    include: { user: true },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  if (event.userId === user?.id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot review your own event!"
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId: user?.id,
      eventId: payload.eventId,
    },
  });

  if (existingReview) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this host!"
    );
  }

  const review = await prisma.review.create({
    data: {
      ...payload,
      userId: user?.id,
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

  await prisma.user.update({
    where: { id: event.userId },
    data: { reviewCount: { increment: 1 } },
  });

  return review;
};

const getAllReviews = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = params;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
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

  const total = await prisma.review.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
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

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
  }

  return review;
};

const updateReview = async (id: string, user: IAuthUser, payload: any) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
  }

  if (user?.role !== UserRole.ADMIN && review.userId !== user?.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this review!"
    );
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: payload,
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

  return updatedReview;
};

const deleteReview = async (id: string, user: IAuthUser) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
  }

  if (user?.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only admin can delete reviews!");
  }

  const event = await prisma.event.findUnique({
    where: { id: review.eventId },
  });

  await prisma.review.delete({
    where: { id },
  });

  if (event) {
    await prisma.user.update({
      where: { id: event.userId },
      data: { reviewCount: { decrement: 1 } },
    });
  }

  return { message: "Review deleted successfully!" };
};

const getHostReviewStats = async (hostId: string) => {
  const host = await prisma.user.findUnique({
    where: { id: hostId },
  });

  if (!host) {
    throw new ApiError(httpStatus.NOT_FOUND, "Host not found!");
  }

  if (host.role !== UserRole.HOST && host.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a host!");
  }

  const events = await prisma.event.findMany({
    where: { userId: hostId },
    select: { id: true },
  });

  const eventIds = events.map((e) => e.id);

  const reviews = await prisma.review.findMany({
    where: { eventId: { in: eventIds } },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    hostId,
    hostName: host.fullName,
    totalEvents: host.hostedEvents,
    totalReviews: host.reviewCount,
    averageRating: Number(averageRating.toFixed(2)),
  };
};

const getHostMyReviews = async (hostId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const events = await prisma.event.findMany({
    where: { userId: hostId },
    select: { id: true },
  });

  const eventIds = events.map((e) => e.id);

  const result = await prisma.review.findMany({
    where: { eventId: { in: eventIds } },
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

  const total = await prisma.review.count({
    where: { eventId: { in: eventIds } },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getHostReviewsByEventId = async (eventId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found!");
  }

  const result = await prisma.review.findMany({
    where: { eventId },
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

  const total = await prisma.review.count({
    where: { eventId },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const reviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getHostReviewStats,
  getHostMyReviews,
  getHostReviewsByEventId,
};
