import { ImageRequestObj } from "./Image";

export interface ServiceObj {
  _id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
  images: ImageRequestObj[];
}

export interface AddServiceRequestObj {
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  images: ImageRequestObj[];
}

export interface UpdateServiceRequestObj {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
  images: ImageRequestObj[];
}
