import { IImageProps } from "./ImageTypes";
import { StoreResponse } from "./ResponseTypes";

export interface IStoreProps {
  data: StoreResponse;
  refetchData: () => void;
}

export interface DeleteStoreParams {
  email: string;
  password: string;
}
