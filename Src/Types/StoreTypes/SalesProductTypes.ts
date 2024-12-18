import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface linksObj {
  label: string;
  link: string;
}

export interface SalesProductObj {
  _id?: string;
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: linksObj[];
}

export interface AddSalesProductData {
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: linksObj[];
}

export interface UpdateSalesProductData {
  salesProductId: string;
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: linksObj[];
}
