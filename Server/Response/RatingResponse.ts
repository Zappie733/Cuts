import { RatingObj } from "../dto/Rating";

export interface GetAllRatingByStoreIdResponse {
  ratings: RatingObj[];
  total: number;
}
