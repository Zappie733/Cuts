import { IDocumentProps } from "./DocumentTypes";
import { IImageProps } from "./ImageTypes";
import * as DocumentPicker from "expo-document-picker";

export interface IRegistrationStoreProps {
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
