import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface GalleryObj {
  _id?: string;
  images: IImageProps[];
  caption: string;
  likes?: number;
  date: Date;
  isPublic: boolean;
}

export interface AddGalleryData {
  images: IImageProps[];
  caption: string;
}

export interface UpdateGalleryData {
  galleryId: string;
  caption: string;
  isPublic: boolean;
}
