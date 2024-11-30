import { ImageRequestObj } from "./Image";

export interface GalleryObj {
  _id?: string;
  images: ImageRequestObj[];
  caption: string;
  likes?: number;
  date: Date;
}

export interface AddGalleryRequestObj {
  images: ImageRequestObj[];
  caption: string;
}

export interface UpdateGalleryRequestObj {
  galleryId: string;
  caption: string;
}

//semua yang ada likenya tidak boleh update image hanya data saja, karena takut adanya penyalahgunaan
