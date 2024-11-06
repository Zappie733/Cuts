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
  deleteWorkerById,
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
  deleteServiceProductById,
  getServiceProductsByStoreId,
  updateServiceProduct,
} from "../Controllers/ServiceProductController";

import {
  addSalesProduct,
  deleteSalesProductById,
  getSalesProductsByStoreId,
  updateSalesProduct,
} from "../Controllers/SalesProductController";

export const StoreRoute = express.Router();

StoreRoute.post("/registerStore", registerStore);
StoreRoute.get("/:id/verifyStore/:token", verifyStore);
StoreRoute.get("/getStoresByUserId", getStoresByUserId);
StoreRoute.delete("/deleteStore", deleteStore);
StoreRoute.get("/getStoresByStatus", getStoresByStatus);
StoreRoute.post("/rejectStore", rejectStore);
StoreRoute.post("/holdStore", holdStore);
StoreRoute.get("/unHoldStore/:id", unHoldStore);
StoreRoute.get("/approveStore/:id", approveStore);

//Worker
StoreRoute.get("/worker/getWorkersByStoreId/:id", getWorkersByStoreId);
StoreRoute.post("/worker/registerWorker", registerWorker);
StoreRoute.delete("/worker/deleteWorkerById/:id", deleteWorkerById);
StoreRoute.put("/worker/updateWorker", updateWorker);
StoreRoute.patch("/worker/clockIn/:id", clockIn);
StoreRoute.patch("/worker/clockOut/:id", clockOut);
StoreRoute.post("/worker/absence", absence);

//Service
StoreRoute.get("/service/getServicesByStoreId/:id", getServicesByStoreId);
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
  "/serviceProduct/deleteServiceProductById/:id",
  deleteServiceProductById
);
StoreRoute.put("/serviceProduct/updateServiceProduct", updateServiceProduct);

//Sales Product
StoreRoute.get(
  "/salesProduct/getSalesProductsByStoreId/:id",
  getSalesProductsByStoreId
);
StoreRoute.post("/salesProduct/addSalesProduct", addSalesProduct);
StoreRoute.delete(
  "/salesProduct/deleteSalesProductById/:id",
  deleteSalesProductById
);
StoreRoute.put("/salesProduct/updateSalesProduct", updateSalesProduct);
