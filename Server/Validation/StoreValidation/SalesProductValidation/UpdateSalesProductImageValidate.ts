import Joi from "joi";
import { UpdateStorePromotionImageRequestObj } from "../../../dto/StorePromotion";

export const UpdateStorePromotionImageValidate = (
  data: UpdateStorePromotionImageRequestObj
) => {
  const schema = Joi.object<UpdateStorePromotionImageRequestObj>({
    promotionId: Joi.string().required().label("Promotion ID"),
    image: Joi.object({
      imageId: Joi.string().label("Image ID"),
      file: Joi.string()
        .pattern(/^[A-Za-z0-9+/]+={0,2}$/)
        .required()
        .label("File"),
      path: Joi.string().required().label("Path"),
    }).required(),
  });
  return schema.validate(data);
};
