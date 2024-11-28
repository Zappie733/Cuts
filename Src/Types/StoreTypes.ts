import { IDocumentProps } from "./ComponentTypes/DocumentTypes";
import { IImageProps } from "./ComponentTypes/ImageTypes";

export interface IStoreComponentProps {
  // data: StoreResponse;
  data: StoreObj;
  refetchData?: () => void;
  changeIsFromReviewRef?: () => void;
}

export interface HistoryObj {
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  isAbsence?: boolean;
  reason?: string;
}
export interface WorkerObj {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker"; //admin adalah org yang diperaya di barber tersebut untuk mengelola bisnis seperti menerima atau menolak pesanan dan melakukan absensi pekerja
  isOnDuty?: boolean;
  history?: HistoryObj[];
  image: IImageProps;
}

export interface ServiceObj {
  _id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
  images: IImageProps[];
}

export interface ServiceProductObj {
  _id?: string;
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean;
  addtionalPrice?: number;
  image: IImageProps;
  isAlerted?: boolean;
}

export interface SalesProductObj {
  _id?: string;
  name: string;
  description?: string;
  images: IImageProps[];
  price: number;
  links: string[];
}

export interface StorePromotionObj {
  _id?: string;
  name: string;
  image: IImageProps;
  startDate: Date;
  endDate: Date;
}

export interface GalleryObj {
  _id?: string;
  images: IImageProps[];
  caption: string;
  likes?: number;
  date: Date;
}

export interface StoreObj {
  _id?: string;
  userId: string;
  email: string;
  images: IImageProps[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  location: string;
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
  storeLocation: string;
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

export interface UnHoldStoreParam {
  storeId: string;
}

export interface ApproveStoreParam {
  storeId: string;
}
