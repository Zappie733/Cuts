import { GalleryObj } from "../StoreTypes/GalleryTypes";
import { SalesProductObj } from "../StoreTypes/SalesProductTypes";
import { ServiceProductObj } from "../StoreTypes/ServiceProductTypes";
import { ServiceObj } from "../StoreTypes/ServiceTypes";
import { StorePromotionObj } from "../StoreTypes/StorePromotionTypes";
import { StoreObj } from "../StoreTypes/StoreTypes";
import { WorkerObj } from "../StoreTypes/WorkerTypes";

export interface GetStoresByUserIdResponse {
  stores: StoreObj[];
  // total: number;
}

export interface StoresByStatusResponse {
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

export interface GetStorePromotionsByStoreIdResponse {
  storePromotions: StorePromotionObj[];
  total: number;
}

export interface GetRecentStorePromotionsByStoreIdResponse {
  storePromotions: StorePromotionObj[];
}

export interface GetGalleryByStoreIdResponse {
  gallery: GalleryObj[];
  total: number;
}

export interface GetMostLikesGalleryByStoreIdResponse {
  gallery: GalleryObj[];
}

export interface GetGalleryByIdResponse {
  gallery: GalleryObj;
}

export interface GetStoreInfoForOrderByIdResponse {
  name: string;

  isOpen: boolean;
  canChooseWorker: boolean;
  toleranceTime: number;

  district: string;
  subDistrict: string;
  location: string;

  rejectedReason?: string;
}

export interface GetWorkerInfoForOrderByIdObj {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  isOnDuty: boolean;
}
export interface GetWorkerInfoForOrderByIdResponse {
  workers: GetWorkerInfoForOrderByIdObj[];
}

export interface GetServiceInfoforOrderByIdResponse {
  id: string;
  name: string;
  price: number;
  duration: number;
  discount?: number;
}

export interface GetServiceProductsInfoForOrderByIdResponse {
  serviceId: string; //fe only
  name: string;
  additionalPrice: number;
}
