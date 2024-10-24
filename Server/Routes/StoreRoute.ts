import express from "express";
import {
  approveStore,
  deleteStore,
  getApprovedStores,
  getHoldStores,
  getRejectedStores,
  getStoresByUserId,
  getWaitingForApprovalStores,
  holdStore,
  registerStore,
  rejectStore,
  unHoldStore,
  verifyStore,
} from "../Controllers/StoreController";

export const StoreRoute = express.Router();
StoreRoute.post("/registerStore", registerStore);
StoreRoute.get("/:id/verifyStore/:token", verifyStore);
StoreRoute.get("/getStoresByUserId", getStoresByUserId);
StoreRoute.delete("/deleteStore", deleteStore);
StoreRoute.get("/getWaitingForApprovalStores", getWaitingForApprovalStores);
StoreRoute.get("/getRejectedStores", getRejectedStores);
StoreRoute.get("/getApprovedStores", getApprovedStores);
StoreRoute.get("/getHoldStores", getHoldStores);
StoreRoute.post("/rejectStore", rejectStore);
StoreRoute.post("/holdStore", holdStore);
StoreRoute.post("/unHoldStore/:id", unHoldStore);
StoreRoute.post("/approveStore/:id", approveStore);
