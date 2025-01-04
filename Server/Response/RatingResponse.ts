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
  rating: RatingObj[];
}

export interface GetRatingSummaryByStoreIdResponse {
  totalRating: number;
  averageRating: number;
  totalRating1: number;
  totalRating2: number;
  totalRating3: number;
  totalRating4: number;
  totalRating5: number;
}
