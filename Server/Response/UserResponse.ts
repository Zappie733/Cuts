import { ImageRequestObj, StoreObj } from "../dto";

export interface LoginDataResponse {
  _id: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image: ImageRequestObj;
}

export interface GetNewAccessTokenResponse {
  accessToken: string;
}

export interface UpdateUserImageResponse {
  image: ImageRequestObj;
}

export interface GetAdminRecentActivityResponse {
  activities: StoreObj[];
}

export interface GetUserInfoForOrderByIdResponse {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
}
