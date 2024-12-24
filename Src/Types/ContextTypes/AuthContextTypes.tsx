export interface IAuthObj {
  _id: string;
  refreshToken: string;
  accessToken: string;
}

export interface IAuthContext {
  auth: IAuthObj;
  setAuth: (auth: IAuthObj) => void;
  getRefreshTokenPayload: () => refreshTokenPayloadObj | null;
  updateAccessToken: (accessToken: string) => void;
  refetchAuth: () => void;
}

export interface refreshTokenPayloadObj {
  _id: string;
  role: "admin" | "user" | "store";
}
