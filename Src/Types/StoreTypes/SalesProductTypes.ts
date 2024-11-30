import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface SalesProductObj {
  _id?: string;
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: string[];
}

export interface AddSalesProductData {
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: string[];
}

export interface UpdateSalesProductData {
  salesProductId: string;
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: string[];
}
