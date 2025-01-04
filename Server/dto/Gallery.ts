import { ImageRequestObj } from "./Image";

export interface GalleryObj {
  _id?: string;
  images: ImageRequestObj[];
  caption: string;
  likes?: number;
  date: Date;
  isPublic: boolean;
}

export interface AddGalleryRequestObj {
  images: ImageRequestObj[];
  caption: string;
}

export interface UpdateGalleryRequestObj {
  galleryId: string;
  caption: string;
  isPublic: boolean;
}
