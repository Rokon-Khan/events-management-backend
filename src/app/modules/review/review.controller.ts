import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { reviewFilterableFields } from "./review.constant";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await reviewService.createReview(req.user as IAuthUser, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully!",
      data: result,
    });
  }
);

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await reviewService.getAllReviews(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getReviewById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully!",
    data: result,
  });
});

const updateReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await reviewService.updateReview(
      req.params.id,
      req.user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review updated successfully!",
      data: result,
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await reviewService.deleteReview(req.params.id, req.user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review deleted successfully!",
      data: result,
    });
  }
);

const getHostReviewStats = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getHostReviewStats(req.params.hostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host review stats retrieved successfully!",
    data: result,
  });
});

const getHostMyReviews = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await reviewService.getHostMyReviews(req.user!.id, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host reviews retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getHostReviewsByEventId = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await reviewService.getHostReviewsByEventId(req.params.eventId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event reviews retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const reviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getHostReviewStats,
  getHostMyReviews,
  getHostReviewsByEventId,
};
