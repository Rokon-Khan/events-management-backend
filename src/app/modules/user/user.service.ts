import { Prisma, PrismaClient, UserStatus } from "@prisma/client";
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
      role: true,
      gender: true,
      dateOfBirth: true,
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
      role: true,
      gender: true,
      dateOfBirth: true,
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

  // Remove sensitive fields that shouldn't be updated
  const {
    email,
    password,
    role,
    status,
    isEmailVerified,
    isDeleted,
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
      role: true,
      gender: true,
      dateOfBirth: true,
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
      role: true,
      gender: true,
      dateOfBirth: true,
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

export const userService = {
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
  getUserById,
};
