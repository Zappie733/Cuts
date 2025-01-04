import { ImageRequestObj } from "./Image";
import { PendingStoreObj } from "./Store";

export interface LikeObj {
  storeId: string;
  imageId: string;
  imageFiles: string[];
}

export interface UserObj {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role: "admin" | "user" | "store";
  verified: boolean;
  image?: ImageRequestObj;
  userId?: string; //setiap obj yang punya userId berarti role dari user tsbt adalah store
  pendingStoreData?: PendingStoreObj;
  likes?: LikeObj[];
}

export interface AuthUser {
  email: string;
  password: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
