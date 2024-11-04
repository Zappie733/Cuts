export interface OrderObj {
  _id?: string;
  userId?: string;
  storeId: string;
  serviceId: string;
  isManual: boolean;
  status?:
    | "Waiting for Confirmation"
    | "Rejected"
    | "Waiting for Payment"
    | "Paid"
    | "Completed";
  totalPrice: number;
  date: Date;
  hasRating?: boolean;
  workerId?: string;
  rejectedReason?: string;
}

export interface AddOrderRequestObj {
  storeId?: string;
  serviceId: string;
  isManual: boolean;
  totalPrice: number;
  workerId?: string;
}

export interface RejectOrderRequestObj {
  orderId: string;
  rejectedReason: string;
}
