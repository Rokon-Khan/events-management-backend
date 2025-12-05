import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  salt_round: process.env.SALT_ROUND,
  jwt: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    expires_in: process.env.EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  thirdPartyApi: {
    baseUrl: process.env.THIRD_PARTY_API_BASE_URL,
    apiAccessToken: process.env.THIRD_PARTY_AUTH_TOKEN,
    apiClientSecret: process.env.THIRD_PARTY_API_CLIENT_SECRET,
    apiClientId: process.env.THIRD_PARTY_API_CLIENT_ID,
    timeout: process.env.THIRD_PARTY_API_TIMEOUT || "60000",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    // publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  },
};
