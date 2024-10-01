export interface LoginDataResponse {
  _id: string;
  refreshToken: string;
  accessToken: string;
}

export interface GetNewAccessTokenResponse {
  accessToken: string;
}
