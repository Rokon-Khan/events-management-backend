import { Request, Response } from "express";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { eventFilterableFields } from "./event.constant";
import { eventService } from "./event.service";

const createEvent = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await eventService.createEvent(req.user as IAuthUser, req);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Event created successfully!",
      data: result,
    });
  }
);

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, eventFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await eventService.getAllEvents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getEventById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event retrieved successfully!",
    data: result,
  });
});

const updateEvent = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await eventService.updateEvent(
      req.params.id,
      req.user as IAuthUser,
      req
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event updated successfully!",
      data: result,
    });
  }
);

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.deleteEvent(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted successfully!",
    data: result,
  });
});

const participateInEvent = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await eventService.participateInEvent(
      req.params.id,
      req.user?.id as string
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successfully participated in event!",
      data: result,
    });
  }
);

const getUpcomingEvents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await eventService.getEventsByStatus("UPCOMING", options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Upcoming events retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getOngoingEvents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await eventService.getEventsByStatus("ONGOING", options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ongoing events retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getCompletedEvents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await eventService.getEventsByStatus("COMPLETED", options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Completed events retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getEventStats = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getEventStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event stats retrieved successfully!",
    data: result,
  });
});

const getMyParticipatedEvents = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await eventService.getMyParticipatedEvents(
      req.user!.id,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My participated events retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getMyParticipatedEventById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await eventService.getMyParticipatedEventById(
      req.user!.id,
      req.params.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My participated event retrieved successfully!",
      data: result,
    });
  }
);

const getMyCreatedEvents = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filters = pick(req.query, eventFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await eventService.getMyCreatedEvents(
      req.user!.id,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My created events retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const eventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  participateInEvent,
  getUpcomingEvents,
  getOngoingEvents,
  getCompletedEvents,
  getEventStats,
  getMyParticipatedEvents,
  getMyParticipatedEventById,
  getMyCreatedEvents,
};
