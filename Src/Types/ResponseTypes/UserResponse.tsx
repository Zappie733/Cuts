import { IDocumentProps } from "../DocumentTypes";
import { IImageProps } from "../ImageTypes";

export interface UserProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image: IImageProps;
}

export interface StoreObj {
  _id?: string;
  userId: string;
  email: string;
  images: IImageProps[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  location: string;
  isOpen: boolean;
  documents: IDocumentProps[];
  // operationalHour: string;
  rejectedReason: string;
  onHoldReason: string;
  approvedBy: string;
  rejectedBy: string;
  holdBy: string;
  unHoldBy: string;
  approvedDate: Date;
  rejectedDate: Date;
  onHoldDate: Date;
  unHoldDate: Date;
}

export interface StoreResponse {
  store: StoreObj;
}

export interface StoresByStatusResponse {
  stores: StoreObj[];
  total: number;
}
