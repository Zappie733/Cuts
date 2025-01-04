import express from "express";
import {
  addRating,
  deleteRatingById,
  getAllRatingByStoreId,
  getAllRatingByStoreIdAndServiceId,
  getRatingByOrderId,
  getRatingSummaryByStoreId,
} from "../Controllers/RatingController";

export const RatingRoute = express.Router();
RatingRoute.post("/addRating", addRating);
RatingRoute.delete("/deleteRatingById/:id", deleteRatingById);
RatingRoute.get("/getAllRatingByStoreId/:id", getAllRatingByStoreId);
RatingRoute.get(
  "/getAllRatingByStoreIdAndServiceId/:storeId/:serviceId",
  getAllRatingByStoreIdAndServiceId
);
RatingRoute.get("/getRatingByOrderId/:id", getRatingByOrderId);
RatingRoute.get("/getRatingSummaryByStoreId/:id", getRatingSummaryByStoreId);
