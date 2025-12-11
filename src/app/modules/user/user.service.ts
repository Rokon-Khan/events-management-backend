import { Prisma, PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { fileUploader } from "../../helpers/fileUploader";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchAbleFields } from "./user.constant";

const prisma = new PrismaClient();

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.UserWhereInput[] = [{ isDeleted: false }];

  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditons: Prisma.UserWhereInput = { AND: andCondions };

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditons,
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

const getAllHosts = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.user.findMany({
    where: {
      role: UserRole.HOST,
      isDeleted: false,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      events: {
        select: { id: true },
      },
    },
  });

  const hostsWithRating = await Promise.all(
    result.map(async (host) => {
      const eventIds = host.events.map((e) => e.id);
      const reviews = await prisma.review.findMany({
        where: { eventId: { in: eventIds } },
        select: { rating: true },
      });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      const { events, ...hostData } = host;
      return {
        ...hostData,
        averageRating: Number(averageRating.toFixed(2)),
      };
    })
  );

  const total = await prisma.user.count({
    where: { role: UserRole.HOST, isDeleted: false },
  });

  return {
    meta: { page, limit, total },
    data: hostsWithRating,
  };
};

const getAllUsers = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
      isDeleted: false,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const usersWithJoinedEvents = result.map((user) => ({
    ...user,
    joinedTotalEvents: user.pertcipatedEvents,
  }));

  const total = await prisma.user.count({
    where: { role: UserRole.USER, isDeleted: false },
  });

  return {
    meta: { page, limit, total },
    data: usersWithJoinedEvents,
  };
};

const changeProfileStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
  });

  return updateUserStatus;
};

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return userInfo;
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  const file = req.file;
  let profilePhoto = userInfo.profilePhoto;

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(
      file,
      profilePhoto as string
    );
    profilePhoto = (uploaded as any)?.secure_url;
  }

  req.body.profilePhoto = profilePhoto;

  const {
    email,
    password,
    role,
    status,
    isEmailVerified,
    isDeleted,
    pertcipatedEvents,
    hostedEvents,
    reviewCount,
    ...updateData
  } = req.body;

  if (updateData.dateOfBirth) {
    updateData.dateOfBirth = new Date(updateData.dateOfBirth);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      gender: true,
      dateOfBirth: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

const getPublicProfile = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profilePhoto: true,
      address: true,
      bio: true,
      interests: true,
      role: true,
      pertcipatedEvents: true,
      hostedEvents: true,
      reviewCount: true,
      createdAt: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return result;
};

export const userService = {
  getAllFromDB,
  getAllHosts,
  getAllUsers,
  changeProfileStatus,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  getUserById,
};
