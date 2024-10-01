export interface UserTokenObj {
  userId: string;
  refreshToken: string;
}

export interface RefreshToken {
  refreshToken: string;
}

export interface AccessToken {
  accessToken: string;
}

export interface PayloadObj {
  _id: string;
  role: string;
}
