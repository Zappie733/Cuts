import { ImageRequestObj } from "./Image";

export interface StoreObj {
  _id?: string;
  userId: string;
  images: ImageRequestObj[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive";
  location: string;
  isOpen: boolean;
  documents: IDocumentProps[];
  // operationalHour: string;
  rejectedReason: string;
}

export interface IDocumentProps {
  documentId?: string;
  name: string;
  file: string;
  path: string;
}
export interface RegisterStoreRequestObj {
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "store";
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "salon" | "barbershop";
  storeLocation: string;
  storeDocuments: IDocumentProps[];
}

export interface PendingStoreObj {
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "salon" | "barbershop";
  storeLocation: string;
  storeDocuments: IDocumentProps[];
}

export interface StoreId {
  email: string;
  password: string;
}
