import { ServiceObj, StoreObj } from "../dto";
import { GalleryObj } from "../dto/Gallery";
import { SalesProductObj } from "../dto/SalesProduct";
import { ServiceProductObj } from "../dto/ServiceProduct";
import { StorePromotionObj } from "../dto/StorePromotion";
import { WorkerObj } from "../dto/Worker";

export interface GetStoresByUserIdResponse {
  stores: StoreObj[];
  // total: number;
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
  district: string;
  subDistrict: string;
  location: string;
  isOpen: boolean;
  rejectedReason?: string;
  canChooseWorker: boolean;
  toleranceTime: number;
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
  name: string;
  additionalPrice: number;
}
