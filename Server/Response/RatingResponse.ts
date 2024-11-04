import { RatingObj } from "../dto/Rating";

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
