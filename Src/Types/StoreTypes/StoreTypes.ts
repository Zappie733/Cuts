import { Double } from "react-native/Libraries/Types/CodegenTypes";
import { IDocumentProps } from "../ComponentTypes/DocumentTypes";
import { IImageProps } from "../ComponentTypes/ImageTypes";
import { GalleryObj } from "./GalleryTypes";
import { SalesProductObj } from "./SalesProductTypes";
import { ServiceProductObj } from "./ServiceProductTypes";
import { ServiceObj } from "./ServiceTypes";
import { StorePromotionObj } from "./StorePromotionTypes";
import { WorkerObj } from "./WorkerTypes";

export interface IStoreComponentProps {
  // data: StoreResponse;
  data: StoreObj;
  refetchData?: () => void;
  changeIsFromReviewRef?: () => void;
}

export interface StoreObj {
  _id?: string;
  userId: string;
  email: string;
  images: IImageProps[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  location: Location;
  isOpen: boolean;
  documents: IDocumentProps[];
  // operationalHour: string;
  rejectedReason: string;
  onHoldReason: string;
  approvedBy: string;
  rejectedBy: string;
  holdBy: string;
  unHoldBy: string;
  approvedDate: Date;
  rejectedDate: Date;
  onHoldDate: Date;
  unHoldDate: Date;

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

export interface Coordinates {
  lat: Double;
  lon: Double;
}

export interface Location {
  address: string;
  coordinates: Coordinates
}

// --------------------------------------
export interface RegistrationStoreData {
  userId?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: "store";
  storeImages: IImageProps[];
  storeName: string;
  storeType: "salon" | "barbershop" | "";
  storeLocationName: String;
  storeLocationCoord: String;
  storeDocuments: IDocumentProps[];
}

export interface DeleteStoreData {
  email: string;
  password: string;
}

export interface GetStoresByStatusParam {
  limit: number;
  offset: number;
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  search: string;
}

export interface RejectStoreData {
  storeId: string;
  rejectedReason: string;
}

export interface HoldStoreData {
  storeId: string;
  onHoldReason: string;
}

export interface UpdateStoreGeneralInformationData {
  name: string;
  images: IImageProps[];
  location: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  canChooseWorker: boolean;
  toleranceTime: number;
}
