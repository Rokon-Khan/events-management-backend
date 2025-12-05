import { UserRole } from "@prisma/client";

type TMiddlewareUser = {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: TMiddlewareUser;
    }
  }
}
