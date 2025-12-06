import { NextFunction, Request, Response } from "express";

export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (key === "interests" && typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch (e) {
          req.body[key] = req.body[key].split(",").map((item: string) => item.trim());
        }
      }
      
      if (["minParticipants", "maxParticipants", "joiningFee"].includes(key)) {
        req.body[key] = Number(req.body[key]);
      }
    });
  }
  next();
};
