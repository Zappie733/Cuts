import { GalleryObj } from "./Gallery";
import { ImageRequestObj } from "./Image";
import { SalesProductObj } from "./SalesProduct";
import { ServiceObj } from "./Service";
import { ServiceProductObj } from "./ServiceProduct";
import { StorePromotionObj } from "./StorePromotion";
import { WorkerObj } from "./Worker";

export interface StoreObj {
  _id?: string;
  userId: string; //user store
  email: string;
  images: ImageRequestObj[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  location: string;
  isOpen: boolean;
  documents: IDocumentProps[];

  rejectedReason?: string;
  onHoldReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  onHoldBy?: string;
  unHoldBy?: string;
  approvedDate?: Date;
  rejectedDate?: Date;
  onHoldDate?: Date;
  unHoldDate?: Date;

  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;

  canChooseWorker: boolean;

  workers: WorkerObj[];

  services: ServiceObj[];

  serviceProducts: ServiceProductObj[];

  salesProducts: SalesProductObj[];

  storePromotions: StorePromotionObj[];

  gallery: GalleryObj[];

  toleranceTime: number;
}

export interface IDocumentProps {
  documentId?: string;
  name: string;
  file: string;
  path?: string;
}

export interface RegisterStoreRequestObj {
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "store";
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "salon" | "barbershop";
  storeLocation: string;
  storeDocuments: IDocumentProps[];
}

export interface PendingStoreObj {
  storeImages: ImageRequestObj[];
  storeName: string;
  storeType: "salon" | "barbershop";
  storeLocation: string;
  storeDocuments: IDocumentProps[];
}

export interface DeleteStoreRequestObj {
  email: string;
  password: string;
}

export interface RejectStoreRequestObj {
  storeId: string;
  rejectedReason: string;
}

export interface OnHoldStoreRequestObj {
  storeId: string;
  onHoldReason: string;
}

//update store
//store open close (is open)

export interface UpdateStoreGeneralInformationRequestObj {
  name: string;
  images: ImageRequestObj[];
  location: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  canChooseWorker: boolean;
  toleranceTime: number;
}
