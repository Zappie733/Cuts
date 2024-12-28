import { OrderObj } from "../dto/Order";
import { OrderHistoryObj } from "../dto/OrderHistory";

export interface GetOrdersByStatusResponse {
  orders: OrderObj[];
  total: number;
}

export interface GetStoreOrderHistoryResponse {
  orders: OrderHistoryObj[];
  total: number;
  summary: OrderSummary[];
}
export interface OrderSummary {
  serviceName: string;
  total: number;
}

export interface GetOrderforScheduleResponse {
  orders: OrderObj[];
  total: number;
}
