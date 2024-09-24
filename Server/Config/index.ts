import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

//PORT: The port where the server listens for requests.
export const PORT = parseInt(process.env.PORT || "");
//HOST: The IP address or domain name of the server.
export const HOST = process.env.HOST || "";

export const MONGODB_URI = process.env.DB || "";

export const JWTPRIVATEKEY = process.env.JWTPRIVATEKEY || "";

//For production, use secret managers to securely store things like DB credentials and JWTPRIVATEKEY, rather than environment files.
