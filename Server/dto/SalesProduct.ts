import { ImageRequestObj } from "./Image";

export interface linksObj {
  label: string;
  link: string;
}

export interface SalesProductObj {
  _id?: string;
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: linksObj[];
}

export interface AddSalesProductRequestObj {
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: linksObj[];
}

export interface UpdateSalesProductRequestObj {
  salesProductId: string;
  name: string;
  description?: string;
  images: ImageRequestObj[];
  price: number;
  links: linksObj[];
}
