import express from "express";
import { loginUser, registerUser } from "../Controllers/UserController";

export const UserRoute = express.Router();
UserRoute.post("/registerUser", registerUser);
UserRoute.post("/loginUser", loginUser);
