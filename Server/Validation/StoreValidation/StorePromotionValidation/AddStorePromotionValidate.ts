import Joi from "joi";
import { AddStorePromotionRequestObj } from "../../../dto/StorePromotion";

export const AddStorePromotionValidate = (
  data: AddStorePromotionRequestObj
) => {
  const schema = Joi.object<AddStorePromotionRequestObj>({
    name: Joi.string().required().label("Name"),
    image: Joi.object({
      file: Joi.string()
        .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
        .required()
        .label("File"),
      // path: Joi.string().required().label("Path"),
    })
      .required()
      .label("Image"),
    startDate: Joi.date().required().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
  });

  return schema.validate(data);
};
