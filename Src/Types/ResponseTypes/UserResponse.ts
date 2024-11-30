import { IDocumentProps } from "../ComponentTypes/DocumentTypes";
import { IImageProps } from "../ComponentTypes/ImageTypes";
import { StoreObj } from "../StoreTypes/StoreTypes";

export interface LoginResponse {
  _id: string;
  refreshToken: string;
  accessToken: string;
}

export interface GetNewAccessTokenResponse {
  accessToken: string;
}

export interface GetUserProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image: IImageProps;
}

export interface UpdateUserProfileImageResponse {
  image: IImageProps;
}

export interface GetAdminRecentActivityResponse {
  activities: StoreObj[];
}
