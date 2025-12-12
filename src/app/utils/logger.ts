import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const logger = pino(
  isProd
    ? {
        level: process.env.LOG_LEVEL || "info",
      }
    : {
        level: process.env.LOG_LEVEL || "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
);

export default logger;

// import pino from "pino";
// const logger = pino({
//   level: process.env.LOG_LEVEL || "info",
//   transport: {
//     target: "pino-pretty",
//     options: {
//       colorize: true,
//       translateTime: "SYS:standard",
//       ignore: "pid,hostname",
//     },
//   },
// });
// export default logger;
