import express from "express";
import {
  deleteStore,
  getStoresByUserId,
  getWaitingForApprovalStores,
  registerStore,
  verifyStore,
} from "../Controllers/StoreController";

export const StoreRoute = express.Router();
StoreRoute.post("/registerStore", registerStore);
StoreRoute.get("/:id/verifyStore/:token", verifyStore);
StoreRoute.get("/getStoresByUserId", getStoresByUserId);
StoreRoute.delete("/deleteStore", deleteStore);
StoreRoute.get("/getWaitingForApprovalStores", getWaitingForApprovalStores);
