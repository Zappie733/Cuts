import { ServiceObj, StoreObj } from "../dto";
import { WorkerObj } from "../dto/Workers";

export interface GetStoreResponse {
  store: StoreObj;
}

export interface GetStoresByStatusResponse {
  stores: StoreObj[];
  total: number;
}

export interface GetWorkersByStoreIdResponse {
  workers: WorkerObj[];
}

export interface GetServicesByStoreIdResponse {
  services: ServiceObj[];
}
