import { IImageProps } from "./ComponentTypes/ImageTypes";

export interface IUserObj {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image: IImageProps;
  userId?: string;
  likes: string[];
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "user"; //admin tidak boleh register dari app, langsung lewat api atau db.
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  email: string;
  password: string;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
