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
  images: IImageProps[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive";
  location: string;
  isOpen: boolean;
  // operationalHour: string;
}

export interface StoreResponse {
  email: string;
  store: StoreObj;
}
