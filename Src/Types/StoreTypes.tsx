import { IImageProps } from "./ImageTypes";
import { StoreResponse } from "./ResponseTypes";

export interface IStoreProps {
  data: StoreResponse;
  refetchData?: () => void;
  changeIsFromReviewRef?: () => void;
}

export interface DeleteStoreParams {
  email: string;
  password: string;
}

export interface RejectStoreParams {
  storeId: string;
  rejectedReason: string;
}

export interface HoldStoreParams {
  storeId: string;
  onHoldReason: string;
}

export interface UnHoldStoreParams {
  storeId: string;
}

export interface ApproveStoreParams {
  storeId: string;
}
