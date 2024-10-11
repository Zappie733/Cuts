import { ImageRequestObj } from "./Image";

export interface StoreObj {
  _id?: string;
  userId: string;
  images: ImageRequestObj[];
  name: string;
  type: "Salon" | "Barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive";
  location: string;
  isOpen: boolean;
  // operationalHour: string;
}

export interface RegisterStoreRequestObj {
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "store";
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "Salon" | "Barbershop";
  storeLocation: string;
}

export interface PendingStoreObj {
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "Salon" | "Barbershop";
  storeLocation: string;
}

export interface StoreId {
  email: string;
  password: string;
}
