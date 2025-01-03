import { AddOrderData } from "../OrderTypes";

export interface IOrderContext {
  orders: AddOrderData[];
  setOrders: (orders: AddOrderData[]) => void;
}
