import Joi from "joi";
import { UpdateGalleryRequestObj } from "../../../dto/Gallery";

export const UpdateGalleryValidate = (data: UpdateGalleryRequestObj) => {
  const schema = Joi.object<UpdateGalleryRequestObj>({
    caption: Joi.string().required().label("Caption"),
  });

  return schema.validate(data);
};
