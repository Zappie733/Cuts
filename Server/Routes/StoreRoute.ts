import express from "express";
import {
  activeStore,
  approveStore,
  deleteStore,
  getStoreByUserId,
  getStoresByStatus,
  getStoresByUserId,
  holdStore,
  inActiveStore,
  registerStore,
  rejectStore,
  unHoldStore,
  updateStoreGeneralInformation,
  updateStoreOpenCloseStatus,
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

import {
  addStorePromotion,
  deleteStorePromotionById,
  getRecentStorePromotionsByStoreId,
  getStorePromotionsByStoreId,
  updateStorePromotion,
} from "../Controllers/StorePromotionController";

import {
  addGallery,
  deleteGalleryById,
  getGalleryByStoreId,
  getMostLikesGalleryByStoreId,
  likeGalleryById,
  updateGallery,
} from "../Controllers/GalleryController";

export const StoreRoute = express.Router();

StoreRoute.post("/registerStore", registerStore);
StoreRoute.get("/:id/verifyStore/:token", verifyStore);
StoreRoute.get("/getStoresByUserId", getStoresByUserId);
StoreRoute.delete("/deleteStore", deleteStore);
StoreRoute.get("/getStoresByStatus", getStoresByStatus);
StoreRoute.patch("/rejectStore", rejectStore);
StoreRoute.patch("/holdStore", holdStore);
StoreRoute.patch("/unHoldStore/:id", unHoldStore);
StoreRoute.patch("/approveStore/:id", approveStore);
StoreRoute.patch("/activeStore", activeStore);
StoreRoute.patch("/inActiveStore", inActiveStore);
StoreRoute.patch(
  "/updateStoreGeneralInformation",
  updateStoreGeneralInformation
);
StoreRoute.patch("/updateStoreOpenCloseStatus", updateStoreOpenCloseStatus);
StoreRoute.get("/getStoreByUserId", getStoreByUserId);

//Worker
StoreRoute.get("/worker/getWorkersByStoreId/:id", getWorkersByStoreId);
StoreRoute.post("/worker/registerWorker", registerWorker);
StoreRoute.delete("/worker/deleteWorkerById/:id", deleteWorkerById);
StoreRoute.put("/worker/updateWorker", updateWorker);
StoreRoute.patch("/worker/clockIn/:id", clockIn);
StoreRoute.patch("/worker/clockOut/:id", clockOut);
StoreRoute.patch("/worker/absence", absence);

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

//Store Promotion
StoreRoute.get(
  "/storePromotion/getStorePromotionsByStoreId/:id",
  getStorePromotionsByStoreId
);
StoreRoute.get(
  "/storePromotion/getRecentStorePromotionsByStoreId/:id",
  getRecentStorePromotionsByStoreId
);
StoreRoute.post("/storePromotion/addStorePromotion", addStorePromotion);
StoreRoute.delete(
  "/storePromotion/deleteStorePromotionById/:id",
  deleteStorePromotionById
);
StoreRoute.put("/storePromotion/updateStorePromotion", updateStorePromotion);

//Gallery
StoreRoute.get("/gallery/getGalleryByStoreId/:id", getGalleryByStoreId);
StoreRoute.get(
  "/gallery/getMostLikesGalleryByStoreId/:id",
  getMostLikesGalleryByStoreId
);
StoreRoute.post("/gallery/addGallery", addGallery);
StoreRoute.delete("/gallery/deleteGalleryById/:id", deleteGalleryById);
StoreRoute.put("/gallery/updateGallery", updateGallery);
StoreRoute.patch("/gallery/likeGalleryById/:id", likeGalleryById);
