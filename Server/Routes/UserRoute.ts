import express from "express";
import {
  getAccessTokenByRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
} from "../Controllers/UserController";

export const UserRoute = express.Router();
UserRoute.post("/registerUser", registerUser);
UserRoute.post("/loginUser", loginUser);
UserRoute.post("/getAccessToken", getAccessTokenByRefreshToken);
UserRoute.post("/logoutUser", logoutUser);
