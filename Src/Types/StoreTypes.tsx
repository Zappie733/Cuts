import { IImageProps } from "./ImageTypes";

export interface IStoreProps {
  email: string;
  images: IImageProps[];
  name: string;
  type: "salon" | "barbershop";
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive";
  location: string;
  isOpen: boolean;
  refetchData: () => void;
}

export interface DeleteStoreParams {
  email: string;
  password: string;
}
