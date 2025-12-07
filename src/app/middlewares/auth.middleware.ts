import { NextFunction, Request, Response } from "express";
// import { jwtHelpers } from "../../helpers/jwtHelpers";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelper";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token = req.headers.authorization;

      // Strip "Bearer " prefix if present
      if (token && token.startsWith("Bearer")) {
        token = token.substring(7);
      }

      // If no token in header, check cookies
      if (!token) {
        token = req.cookies?.accessToken;
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_access_secret as Secret
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
