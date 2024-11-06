import { ServiceObj, StoreObj } from "../dto";
import { SalesProductObj } from "../dto/SalesProduct";
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
  total: number;
}

export interface GetServicesByStoreIdResponse {
  services: ServiceObj[];
  total: number;
}

export interface GetServiceProductsByStoreIdResponse {
  serviceProducts: ServiceProductObj[];
  total: number;
}

export interface GetSalesProductsByStoreIdResponse {
  salesProducts: SalesProductObj[];
  total: number;
}
