import { StoreObj } from "../StoreTypes/StoreTypes";

export interface IStoreContext {
  store: StoreObj;
  setStore: (store: StoreObj) => void;
  refetchData: () => void;
  refetchStoreById: (storeId: string) => void;
}
