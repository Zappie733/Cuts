export interface OrderObj {
  _id?: string;
  userId?: string;
  storeId: string;
  serviceId: string;
  isManual: boolean;
  status?:
    | "Waiting for Confirmation"
    | "Waiting for Payment"
    | "Paid"
    | "Completed";
  totalPrice: number;
  date: Date;
}

export interface AddOrderRequestObj {
  storeId?: string;
  serviceId: string;
  isManual: boolean;
  totalPrice: number;
}
