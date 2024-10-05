import { UpdateUserParams } from "./Users";

export interface VerifiedTokenObj {
  userId: string;
  token: string;
}

export interface VerifyToken {
  verifyToken: string;
}

export interface PayloadVerifyTokenObj {
  _id: string;
  password?: string;
  verified?: boolean;
  updateUserParams?: UpdateUserParams;
}
