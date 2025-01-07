import express from "express";
import {
  activeStore,
  approveStore,
  deleteStore,
  getStoreById,
  getStoreByUserId,
  getStoreInfoForOrderById,
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
  getWorkersInfoForOrderById,
  getWorkersByStoreId,
  registerWorker,
  updateWorker,
} from "../Controllers/WorkerController";

import {
  addService,
  deleteService,
  getServiceInfoforOrderById,
  getServicesByStoreId,
  updateService,
} from "../Controllers/ServiceController";

import {
  addServiceProduct,
  deleteServiceProductById,
  getServiceProductsByStoreId,
  getServiceProductsInfoForOrderById,
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
  getGalleryById,
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
StoreRoute.get("/getStoreById/:id", getStoreById);
StoreRoute.get("/getStoreInfoForOrderById/:id", getStoreInfoForOrderById);

//Worker
StoreRoute.get("/worker/getWorkersByStoreId/:id", getWorkersByStoreId);
StoreRoute.post("/worker/registerWorker", registerWorker);
StoreRoute.delete("/worker/deleteWorkerById/:id", deleteWorkerById);
StoreRoute.put("/worker/updateWorker", updateWorker);
StoreRoute.patch("/worker/clockIn/:id", clockIn);
StoreRoute.patch("/worker/clockOut/:id", clockOut);
StoreRoute.patch("/worker/absence", absence);
StoreRoute.get(
  "/worker/getWorkersInfoForOrderById/:id",
  getWorkersInfoForOrderById
);

//Service
StoreRoute.get("/service/getServicesByStoreId/:id", getServicesByStoreId);
StoreRoute.post("/service/addService", addService);
StoreRoute.delete("/service/deleteService/:id", deleteService);
StoreRoute.put("/service/updateService", updateService);
StoreRoute.get(
  "/service/getServiceInfoforOrderById/:storeId/:serviceId",
  getServiceInfoforOrderById
);

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
StoreRoute.get(
  "/serviceProduct/getServiceProductsInfoForOrderById/:storeId/:serviceProductId",
  getServiceProductsInfoForOrderById
);

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
StoreRoute.patch("/gallery/likeGalleryById/:storeId/:id", likeGalleryById);
StoreRoute.get("/gallery/getGalleryById/:storeId/:id", getGalleryById);
