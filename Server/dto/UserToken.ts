export interface UserTokenObj {
  userId: string;
  refreshToken: string;
}

export interface RefreshTokenObj {
  refreshToken: string;
}

export interface PayloadObj {
  _id: string;
  roles: string;
}
