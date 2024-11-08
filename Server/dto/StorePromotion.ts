import { ImageRequestObj } from "./Image";

export interface StorePromotionObj {
  _id?: string;
  name: string;
  image: ImageRequestObj;
  startDate: Date;
  endDate: Date;
}

export interface AddStorePromotionRequestObj {
  name: string;
  image: ImageRequestObj;
  startDate: Date;
  endDate: Date;
}

export interface UpdateStorePromotionRequestObj {
  promotionId: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateStorePromotionImageRequestObj {
  promotionId: string;
  image: ImageRequestObj;
}
