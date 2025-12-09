import { PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

const createBecomeHostRequest = async (user: IAuthUser, payload: any) => {
  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (userData.role !== UserRole.USER) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only USER role can request to become HOST!"
    );
  }

  const existingRequest = await prisma.becomeHost.findFirst({
    where: { userId: user?.id },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already submitted a request!"
    );
  }

  const request = await prisma.becomeHost.create({
    data: {
      userId: user?.id as string,
      hostExperience: payload.hostExperience,
      typeOfEvents: payload.typeOfEvents,
      whyHost: payload.whyHost,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  logger.info(`Become host request created by user: ${user?.email}`);

  return request;
};

const createBecomeHostByAdmin = async (payload: any) => {
  const userData = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (userData.role !== UserRole.USER) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User must have USER role!");
  }

  const existingRequest = await prisma.becomeHost.findFirst({
    where: { userId: payload.userId },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Request already exists for this user!"
    );
  }

  const request = await prisma.becomeHost.create({
    data: {
      userId: payload.userId,
      hostExperience: payload.hostExperience,
      typeOfEvents: payload.typeOfEvents,
      whyHost: payload.whyHost,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: payload.userId },
    data: { role: UserRole.HOST },
  });

  logger.info(`User ${userData.email} upgraded to HOST by admin`);

  return request;
};

const getAllBecomeHostRequests = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.becomeHost.findMany({
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
          role: true,
          profilePhoto: true,
        },
      },
    },
  });

  const total = await prisma.becomeHost.count();

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getBecomeHostById = async (id: string) => {
  const request = await prisma.becomeHost.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found!");
  }

  return request;
};

const updateBecomeHostRequest = async (id: string, payload: any) => {
  const request = await prisma.becomeHost.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found!");
  }

  if (request.user.role === UserRole.HOST) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is already a HOST!");
  }

  if (payload.approveHost === true) {
    await prisma.user.update({
      where: { id: request.userId },
      data: { role: UserRole.HOST },
    });

    logger.info(`User ${request.user.email} upgraded to HOST`);
  }

  const updatedRequest = await prisma.becomeHost.update({
    where: { id },
    data: { updatedAt: new Date() },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedRequest;
};

const deleteBecomeHostRequest = async (id: string) => {
  const request = await prisma.becomeHost.findUnique({
    where: { id },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found!");
  }

  await prisma.becomeHost.delete({
    where: { id },
  });

  logger.info(`Become host request deleted: ${id}`);

  return { message: "Request deleted successfully!" };
};

export const becomeHostService = {
  createBecomeHostRequest,
  createBecomeHostByAdmin,
  getAllBecomeHostRequests,
  getBecomeHostById,
  updateBecomeHostRequest,
  deleteBecomeHostRequest,
};
