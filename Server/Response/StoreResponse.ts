import { ServiceObj, StoreObj } from "../dto";
import { ServiceProductObj } from "../dto/ServiceProduct";
import { WorkerObj } from "../dto/Worker";

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

export interface GetServiceProductsByStoreIdResponse {
  serviceProducts: ServiceProductObj[];
}
