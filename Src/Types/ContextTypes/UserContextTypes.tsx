import { IImageProps } from "../ComponentTypes/ImageTypes";
import { IUserObj } from "../UserTypes";

export interface IUserContext {
  user: IUserObj;
  setUser: (user: IUserObj) => void;
  updateUserImage: (image: IImageProps) => void;
}
