import { StoreObj } from "../StoreTypes";

export interface GetStoresByUserIdResponse {
  stores: StoreObj[];
  // total: number;
}

export interface StoresByStatusResponse {
  stores: StoreObj[];
  total: number;
}
