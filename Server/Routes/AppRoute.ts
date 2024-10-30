import express from "express";
import { getAppSummary } from "../Controllers/AppController";

export const AppRoute = express.Router();
AppRoute.get("/getAppSummary", getAppSummary);
