import { IImageProps } from "./ImageTypes";

export interface IUserObj {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image: IImageProps;
}

export interface IUserContext {
  user: IUserObj;
  setUser: (user: IUserObj) => void;
  updateUserImage: (image: IImageProps) => void;
}
