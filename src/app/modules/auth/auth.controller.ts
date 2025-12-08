import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthServices } from "./auth.service";

const registration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registration(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Registration successful! Please verify your email.",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully!",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: Number(process.env.EXPIRES_IN) || 86400, // 24 hours
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 604800, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: { accessToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);
  res.cookie("accessToken", result.accessToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: { accessToken: result.accessToken },
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;

    const result = await AuthServices.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed successfully",
      data: result,
    });
  }
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset OTP sent!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
    data: result,
  });
});

const getMe = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    // const user = req.user;
    const user = req.cookies;

    const result = await AuthServices.getMe(user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resendOTP(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully!",
    data: result,
  });
});

// const logout = catchAsync(async (req: Request, res: Response) => {
//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Logged out successfully!",
//     data: null,
//   });
// });

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    secure: true,
    httpOnly: true,
    sameSite: "none",
  });
  res.clearCookie("refreshToken", {
    secure: true,
    httpOnly: true,
    sameSite: "none",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully!",
    data: null,
  });
});

export const AuthController = {
  registration,
  verifyEmail,
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
  resendOTP,
  logout,
};
