import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface StorePromotionObj {
  _id?: string;
  name: string;
  image: IImageProps;
  startDate: Date;
  endDate: Date;
}

export interface AddStorePromotionData {
  name: string;
  image: IImageProps;
  startDate: Date;
  endDate: Date;
}

export interface UpdateStorePromotionData {
  promotionId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: IImageProps;
}
