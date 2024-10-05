import express from "express";
import {
  changeUserPassword,
  getAccessTokenByRefreshToken,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  verifyUpdateUser,
  verifyUser,
  verifyUserPassword,
} from "../Controllers/UserController";

export const UserRoute = express.Router();
UserRoute.post("/registerUser", registerUser);
UserRoute.post("/loginUser", loginUser);
UserRoute.post("/getAccessToken", getAccessTokenByRefreshToken);
UserRoute.post("/logoutUser", logoutUser);
UserRoute.get("/:id/verifyUser/:token", verifyUser);
UserRoute.post("/changeUserPassword", changeUserPassword);
UserRoute.get("/:id/verifyUserPassword/:token", verifyUserPassword);
UserRoute.get("/getUserProfile", getUserProfile);
UserRoute.post("/updateUserProfile", updateUserProfile);
UserRoute.get("/:id/verifyUpdateUser/:token", verifyUpdateUser);
