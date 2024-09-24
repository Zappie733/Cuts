import express, { Application } from "express";
import cors from "cors";

export default async (app: Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  return app;
};
