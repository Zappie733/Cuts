import express, { Application } from "express";
import cors from "cors";
import { UserRoute } from "../Routes";

export default async (app: Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  // Set the view engine to EJS
  app.set("view engine", "ejs");

  app.use("/user", UserRoute);
  return app;
};
