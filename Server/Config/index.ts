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

export const SALT = 10;
