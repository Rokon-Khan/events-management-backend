import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { reportsService } from "./reports.service";

const getAdminDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.getAdminDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dashboard stats retrieved successfully!",
    data: result,
  });
});

const getHostStats = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await reportsService.getHostStats(req.user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Host stats retrieved successfully!",
      data: result,
    });
  }
);

const getUserStats = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await reportsService.getUserStats(req.user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User stats retrieved successfully!",
      data: result,
    });
  }
);

const getHostStatsPublic = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.getHostStatsPublic();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host stats retrieved successfully!",
    data: result,
  });
});

const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.getPaymentStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment stats retrieved successfully!",
    data: result,
  });
});

export const reportsController = {
  getAdminDashboardStats,
  getHostStats,
  getUserStats,
  getHostStatsPublic,
  getPaymentStats,
};
