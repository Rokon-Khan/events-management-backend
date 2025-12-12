import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { favouriteEventsService } from "./favouriteEvents.service";

const addToFavourites = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await favouriteEventsService.addToFavourites(
      req.user as IAuthUser,
      req.body.eventId
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Event added to favourites successfully!",
      data: result,
    });
  }
);

const getMyFavourites = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await favouriteEventsService.getMyFavourites(
      req.user as IAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Favourite events retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const removeFromFavourites = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await favouriteEventsService.removeFromFavourites(
      req.user as IAuthUser,
      req.params.eventId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event removed from favourites successfully!",
      data: result,
    });
  }
);

export const favouriteEventsController = {
  addToFavourites,
  getMyFavourites,
  removeFromFavourites,
};