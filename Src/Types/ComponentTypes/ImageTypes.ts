export interface IImageProps {
  imageId?: string;
  file: string;
  path?: string;
}

export interface SelectImageProps {
  userImage: string;
}

export interface SelectImagesProps {
  imagesData?: IImageProps[];
  handleSetImages: (images: IImageProps[]) => void;
}

export interface SelectSingleImageProps {
  imageData?: IImageProps;
  handleSetImage: (image: IImageProps | null) => void;
}
