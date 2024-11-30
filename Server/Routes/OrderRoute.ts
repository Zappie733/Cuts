import express from "express";
import {
  addOrder,
  completeOrder,
  confirmOrder,
  getOrderforSchedule,
  getOrdersByStatus,
  getStoreOrderHistory,
  payOrder,
  rejectOrder,
} from "../Controllers/OrderController";

export const OrderRoute = express.Router();
OrderRoute.post("/addOrder", addOrder);
OrderRoute.get("/getOrdersByStatus", getOrdersByStatus);
OrderRoute.get("/getStoreOrderHistory", getStoreOrderHistory);
OrderRoute.get("/getOrderforSchedule/:id", getOrderforSchedule);
OrderRoute.patch("/confirmOrder/:id", confirmOrder);
OrderRoute.patch("/payOrder/:id", payOrder);
OrderRoute.patch("/completeOrder/:id", completeOrder);
OrderRoute.patch("/rejectOrder", rejectOrder);
