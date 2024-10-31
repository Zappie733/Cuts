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

import {
  absence,
  clockIn,
  clockOut,
  deleteWorker,
  getWorkersByStoreId,
  registerWorker,
  updateWorker,
} from "../Controllers/WorkerController";

import {
  addService,
  deleteService,
  getServicesByStoreId,
  updateService,
} from "../Controllers/ServiceController";

import {
  addServiceProduct,
  deleteServiceProduct,
  getServiceProductsByStoreId,
  updateServiceProduct,
} from "../Controllers/ServiceProductController";

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

//Worker
StoreRoute.get("/worker/getWorkersByStoreId", getWorkersByStoreId);
StoreRoute.post("/worker/registerWorker", registerWorker);
StoreRoute.delete("/worker/deleteWorker/:id", deleteWorker);
StoreRoute.put("/worker/updateWorker", updateWorker);
StoreRoute.patch("/worker/clockIn/:id", clockIn);
StoreRoute.patch("/worker/clockOut/:id", clockOut);
StoreRoute.post("/worker/absence", absence);

//Service
StoreRoute.get("/service/getServicesByStoreId", getServicesByStoreId);
StoreRoute.post("/service/addService", addService);
StoreRoute.delete("/service/deleteService/:id", deleteService);
StoreRoute.put("/service/updateService", updateService);

//Service Product
StoreRoute.get(
  "/serviceProduct/getServiceProductsByStoreId",
  getServiceProductsByStoreId
);
StoreRoute.post("/serviceProduct/addServiceProduct", addServiceProduct);
StoreRoute.delete(
  "/serviceProduct/deleteServiceProduct/:id",
  deleteServiceProduct
);
StoreRoute.put("/serviceProduct/updateServiceProduct", updateServiceProduct);
