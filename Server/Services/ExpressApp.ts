import express, { Application } from "express";
import cors from "cors";
import { ImageRoute, UserRoute } from "../Routes";

export default async (app: Application) => {
  app.use(cors());
  app.use(express.json({ limit: "10mb" })); // For JSON payloads
  app.use(express.urlencoded({ limit: "10mb", extended: true })); // For URL-encoded payloads

  // Set the view engine to EJS
  app.set("view engine", "ejs");

  app.use("/user", UserRoute);
  app.use("/image", ImageRoute);
  return app;
};
