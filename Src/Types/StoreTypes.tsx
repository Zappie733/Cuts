import { IImageProps } from "./ImageTypes";

export interface IStoreProps {
  email: string;
  images: IImageProps[];
  name: string;
  type: "Salon" | "Barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive";
  location: string;
  isOpen: boolean;
  refetchData: () => void;
}

export interface DeleteStoreParams {
  email: string;
  password: string;
}
