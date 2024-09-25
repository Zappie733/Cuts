import express, { Application } from "express";
import cors from "cors";
import { UserRoute } from "../Routes";

export default async (app: Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  app.use("/user", UserRoute);
  return app;
};
