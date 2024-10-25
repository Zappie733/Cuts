import express from "express";
import {
  approveStore,
  deleteStore,
  getStoresByStatus,
  getStoresByUserId,
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
StoreRoute.get("/getStoresByStatus", getStoresByStatus);
StoreRoute.post("/rejectStore", rejectStore);
StoreRoute.post("/holdStore", holdStore);
StoreRoute.post("/unHoldStore/:id", unHoldStore);
StoreRoute.post("/approveStore/:id", approveStore);
