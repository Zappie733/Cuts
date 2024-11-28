export interface IImageProps {
  imageId?: string;
  file: string;
  path?: string;
}

export interface SelectImageProps {
  userImage: string;
}

export interface SelectImagesProps {
  handleSetImages: (images: IImageProps[]) => void;
}
