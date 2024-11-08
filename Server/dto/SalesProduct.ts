import { ImageRequestObj } from "./Image";

export interface SalesProductObj {
  _id?: string;
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: string[];
}

export interface AddSalesProductRequestObj {
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: string[];
}

export interface UpdateSalesProductRequestObj {
  salesProductId: string;
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: string[];
}
