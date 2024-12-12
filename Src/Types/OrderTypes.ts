export interface chosenServiceProductObj {
  serviceId: string;
  serviceProductIds: string[];
}

export interface OrderObj {
  _id?: string;
  userId?: string;
  storeId: string;
  serviceIds: string[];
  chosenServiceProductsIds?: chosenServiceProductObj[];
  isManual: boolean;
  status?:
    | "Waiting for Confirmation"
    | "Rejected"
    | "Waiting for Payment"
    | "Paid"
    | "Completed";
  totalPrice: number;
  totalDuration: number;
  date: Date;
  endTime: Date;
  hasRating?: boolean;
  workerId?: string;
  rejectedReason?: string;
  userName?: string; //untuk manual
  timeDifference?: number;
}

export interface AddOrderData {
  storeId?: string;
  serviceIds: string[];
  chosenServiceProductsIds?: chosenServiceProductObj[];
  isManual: boolean;
  totalPrice: number;
  totalDuration: number;
  date?: Date;
  workerId?: string;
  userName?: string;
}

export interface RejectOrderData {
  orderId: string;
  rejectedReason: string;
}
