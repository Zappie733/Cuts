export interface ServiceProductHistoryObj {
  id?: string;
  name: string;
  addtionalPrice?: number;
}

export interface ServiceHistoryObj {
  id?: string;
  name: string;
  price: number;
  duration: number;
  discount?: number;
  serviceProducts?: ServiceProductHistoryObj[];
}

export interface OrderHistoryObj {
  _id?: string;
  orderId: string;
  userId?: string;
  userName: string;
  userPhone: string;
  storeId: string;
  services: ServiceHistoryObj[];
  isManual: boolean;
  status?: "Rejected" | "Paid" | "Completed";
  totalPrice: number;
  totalDuration: number;
  date: Date;
  endTime: Date;
  hasRating?: boolean;
  workerId: string;
  workerName: string;
  rejectedReason?: string;
  timeDifference?: number;

  createdAt: Date;
}
