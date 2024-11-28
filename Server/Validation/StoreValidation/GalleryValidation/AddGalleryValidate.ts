import Joi from "joi";
import { AddGalleryRequestObj } from "../../../dto/Gallery";

export const AddGalleryValidate = (data: AddGalleryRequestObj) => {
  const schema = Joi.object<AddGalleryRequestObj>({
    images: Joi.array()
      .items(
        Joi.object({
          file: Joi.string()
            .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
            .required()
            .label("File"),
          // path: Joi.string().required().label("Path"),
        })
      )
      .min(1)
      .required()
      .label("Images"),
    caption: Joi.string().required().label("Caption"),
  });

  return schema.validate(data);
};
