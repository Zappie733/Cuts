import express from "express";
import {
  addRating,
  deleteRating,
  getAllRatingByStoreId,
  getAllRatingByStoreIdAndServiceId,
} from "../Controllers/RatingController";

export const RatingRoute = express.Router();
RatingRoute.post("/addRating", addRating);
RatingRoute.delete("/deleteRating/:id", deleteRating);
RatingRoute.get("/getAllRatingByStoreId/:id", getAllRatingByStoreId);
RatingRoute.get(
  "/getAllRatingByStoreIdAndServiceId/:storeId/:serviceId",
  getAllRatingByStoreIdAndServiceId
);
