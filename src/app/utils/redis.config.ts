// import { createClient } from "redis";

// export const redisClient = createClient({
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: Number(process.env.REDIS_PORT),
//   },
// });

// redisClient.on("error", (err) => {
//   console.log("Redis Client Error", err);
// });

// export const connectRedis = async (): Promise<void> => {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//     console.log("Redis Connected");
//   }
// };

// export const disconnectRedis = async (): Promise<void> => {
//   if (redisClient.isOpen) {
//     await redisClient.quit();
//     console.log("Redis Disconnected");
//   }
// };

// // For compatibility with existing services importing getRedis()
// export const getRedis = () => redisClient;


import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const getRedis = () => {
  if (!redisClient) {
    redisClient = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
  }

  if (!redisClient.isOpen) {
    redisClient.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });
  }

  return redisClient;
};
