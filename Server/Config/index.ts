import { config } from "dotenv";
config({ path: ".env.development" });

//PORT: The port where the server listens for requests.
export const PORT = parseInt(process.env.PORT || "");
//HOST: The IP address or domain name of the server.
export const HOST = process.env.HOST || "";

export const MONGODB_URI = process.env.DB || "";

export const JWTPRIVATEKEY = process.env.JWTPRIVATEKEY || "";

export const REFRESH_TOKEN_PRIVATE_KEY =
  process.env.REFRESH_TOKEN_PRIVATE_KEY || "";

export const ACCESS_TOKEN_PRIVATE_KEY =
  process.env.ACCESS_TOKEN_PRIVATE_KEY || "";
//For production, use secret managers to securely store things like DB credentials and JWTPRIVATEKEY, rather than environment files.

export const SALT = process.env.SALT;

export const BASE_URL = process.env.BASE_URL || "";
export const EMAILHOST = process.env.EMAILHOST || "";
export const SERVICE = process.env.SERVICE || "";
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "");
export const SECURE = process.env.SECURE;
export const USER = process.env.USER || "";
export const PASS = process.env.PASS || "";

export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "";
export const IMAGEKIT_BASEURL = process.env.IMAGEKIT_BASEURL || "";
