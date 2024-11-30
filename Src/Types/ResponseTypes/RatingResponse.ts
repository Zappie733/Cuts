import { RatingObj } from "../RatingTypes";

export interface GetAllRatingByStoreIdResponse {
  ratings: RatingObj[];
  total: number;
}

export interface GetAllRatingByStoreIdAndServiceIdResponse {
  ratings: RatingObj[];
  total: number;
}

export interface GetRatingByOrderIdResponse {
  rating: RatingObj;
}
