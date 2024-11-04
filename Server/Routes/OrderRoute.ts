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
OrderRoute.get("/getOrderforSchedule", getOrderforSchedule);
OrderRoute.get("/confirmOrder/:id", confirmOrder);
OrderRoute.get("/payOrder/:id", payOrder);
OrderRoute.get("/completeOrder/:id", completeOrder);
OrderRoute.post("/rejectOrder", rejectOrder);
