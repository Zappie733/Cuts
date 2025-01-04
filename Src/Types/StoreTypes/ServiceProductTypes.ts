import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface ServiceProductObj {
  _id?: string;
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean;
  addtionalPrice?: number;
  image: IImageProps;
  isAlerted?: boolean;
}

export interface AddServiceProductData {
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean | null;
  addtionalPrice?: number;
  image: IImageProps;
}

export interface UpdateServiceProductData {
  serviceProductId: string;
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean | null;
  addtionalPrice?: number;
  image: IImageProps;
}
