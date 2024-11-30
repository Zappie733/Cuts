import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface ServiceObj {
  _id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
  images: IImageProps[];
}

export interface AddServiceData {
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  images: IImageProps[];
}

export interface UpdateServiceData {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
  images: IImageProps[];
}
