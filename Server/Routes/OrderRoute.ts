import express from "express";
import {
  addOrder,
  getOrderforSchedule,
  getOrdersByStatus,
  getStoreOrderHistory,
} from "../Controllers/OrderController";

export const OrderRoute = express.Router();
OrderRoute.post("/addOrder", addOrder);
OrderRoute.get("/getOrdersByStatus", getOrdersByStatus);
OrderRoute.get("/getStoreOrderHistory", getStoreOrderHistory);
OrderRoute.get("/getOrderforSchedule", getOrderforSchedule);
