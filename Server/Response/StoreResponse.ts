import { StoreObj } from "../dto";

export interface GetStoreResponse {
  store: StoreObj;
}

export interface GetStoresByStatusResponse {
  stores: StoreObj[];
  total: number;
}
