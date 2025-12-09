import { PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";

const prisma = new PrismaClient();

const getAdminDashboardStats = async () => {
  const totalUsers = await prisma.user.count({
    where: { role: UserRole.USER, isDeleted: false },
  });

  const totalHosts = await prisma.user.count({
    where: { role: UserRole.HOST, isDeleted: false },
  });

  const totalEvents = await prisma.event.count();

  const payments = await prisma.payment.findMany({
    where: { paymentStatus: "COMPLETED" },
    select: { amount: true },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalUsers,
    totalHosts,
    totalEvents,
    totalRevenue: Number(totalRevenue.toFixed(2)),
  };
};

const getHostStats = async (user: IAuthUser) => {
  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const totalEventsHosted = await prisma.event.count({
    where: { userId: user?.id },
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyEventsHosted = await prisma.event.count({
    where: {
      userId: user?.id,
      createdAt: { gte: firstDayOfMonth },
    },
  });

  const hostEvents = await prisma.event.findMany({
    where: { userId: user?.id },
    select: { id: true },
  });

  const eventIds = hostEvents.map((e) => e.id);

  const payments = await prisma.payment.findMany({
    where: {
      eventId: { in: eventIds },
      paymentStatus: "COMPLETED",
    },
    select: { amount: true },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const reviews = await prisma.review.findMany({
    where: { eventId: { in: eventIds } },
    select: { rating: true },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    totalEventsHosted,
    monthlyEventsHosted,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    averageRating: Number(averageRating.toFixed(2)),
  };
};

const getUserStats = async (user: IAuthUser) => {
  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const totalEventsParticipants = userData.pertcipatedEvents;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyPayments = await prisma.payment.count({
    where: {
      userId: user?.id,
      paymentStatus: "COMPLETED",
      createdAt: { gte: firstDayOfMonth },
    },
  });

  const totalReviewsGiven = await prisma.review.count({
    where: { userId: user?.id },
  });

  const reviews = await prisma.review.findMany({
    where: { userId: user?.id },
    select: { rating: true },
  });

  const averageRatingGiven =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    totalEventsParticipants,
    monthlyEventsParticipants: monthlyPayments,
    totalReviewsGiven,
    averageRatingGiven: Number(averageRatingGiven.toFixed(2)),
  };
};

const getHostStatsPublic = async () => {
  const totalHost = await prisma.user.count({
    where: { role: UserRole.HOST, isDeleted: false },
  });

  const totalRequestHosts = await prisma.becomeHost.count();

  const hosts = await prisma.user.findMany({
    where: { role: UserRole.HOST, isDeleted: false },
    select: {
      events: {
        select: { id: true },
      },
    },
  });

  const allEventIds = hosts.flatMap((h) => h.events.map((e) => e.id));

  const reviews = await prisma.review.findMany({
    where: { eventId: { in: allEventIds } },
    select: { rating: true },
  });

  const averageHostRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    totalHost,
    totalRequestHosts,
    averageHostRating: Number(averageHostRating.toFixed(2)),
  };
};

const getPaymentStats = async () => {
  const payments = await prisma.payment.findMany({
    where: { paymentStatus: "COMPLETED" },
    select: { amount: true, createdAt: true, eventId: true },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentMonthPayments = payments.filter(
    (p) => p.createdAt >= firstDayOfMonth
  );
  const totalCurrentMonthRevenue = currentMonthPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const totalPendingPayouts = await prisma.payment.count({
    where: { paymentStatus: "PENDING" },
  });

  const totalEvents = await prisma.event.count();
  const averagePerEventRevenue =
    totalEvents > 0 ? totalRevenue / totalEvents : 0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCurrentMonthRevenue: Number(totalCurrentMonthRevenue.toFixed(2)),
    totalPendingPayouts,
    averagePerEventRevenue: Number(averagePerEventRevenue.toFixed(2)),
  };
};

export const reportsService = {
  getAdminDashboardStats,
  getHostStats,
  getUserStats,
  getHostStatsPublic,
  getPaymentStats,
};
