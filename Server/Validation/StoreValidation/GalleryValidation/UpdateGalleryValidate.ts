import Joi from "joi";
import { UpdateGalleryRequestObj } from "../../../dto/Gallery";

export const UpdateGalleryValidate = (data: UpdateGalleryRequestObj) => {
  const schema = Joi.object<UpdateGalleryRequestObj>({
    galleryId: Joi.string().required().label("Gallery ID"),
    caption: Joi.string().required().label("Caption"),
    isPublic: Joi.boolean().required().label("Is Public"),
  });

  return schema.validate(data);
};
