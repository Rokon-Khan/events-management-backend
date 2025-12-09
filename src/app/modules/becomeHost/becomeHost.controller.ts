import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { becomeHostService } from "./becomeHost.service";

const createBecomeHostRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await becomeHostService.createBecomeHostRequest(
      req.user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Become host request submitted successfully!",
      data: result,
    });
  }
);

const createBecomeHostByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await becomeHostService.createBecomeHostByAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User upgraded to HOST successfully!",
    data: result,
  });
});

const getAllBecomeHostRequests = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, []);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await becomeHostService.getAllBecomeHostRequests(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Become host requests retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getBecomeHostById = catchAsync(async (req: Request, res: Response) => {
  const result = await becomeHostService.getBecomeHostById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request retrieved successfully!",
    data: result,
  });
});

const updateBecomeHostRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await becomeHostService.updateBecomeHostRequest(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request updated successfully!",
    data: result,
  });
});

const deleteBecomeHostRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await becomeHostService.deleteBecomeHostRequest(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request deleted successfully!",
    data: result,
  });
});

export const becomeHostController = {
  createBecomeHostRequest,
  createBecomeHostByAdmin,
  getAllBecomeHostRequests,
  getBecomeHostById,
  updateBecomeHostRequest,
  deleteBecomeHostRequest,
};
