import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface StorePromotionObj {
  _id?: string;
  name: string;
  image: IImageProps;
  startDate: Date;
  endDate: Date;
  showImageOnly: boolean;
}

export interface AddStorePromotionData {
  name: string;
  image: IImageProps;
  startDate: Date | null;
  endDate: Date | null;
  showImageOnly: boolean;
}

export interface UpdateStorePromotionData {
  promotionId: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  image: IImageProps;
  showImageOnly: boolean;
}
