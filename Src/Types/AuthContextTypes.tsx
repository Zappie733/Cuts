export interface IAuthObj {
  _id: string;
  refreshToken: string;
  accessToken: string;
}

export interface IAuthContext {
  auth: IAuthObj;
  setAuth: (auth: IAuthObj) => void;
}
