import Joi from "joi";
import { UpdateStorePromotionRequestObj } from "../../../dto/StorePromotion";

export const UpdateStorePromotionValidate = (
  data: UpdateStorePromotionRequestObj
) => {
  const schema = Joi.object<UpdateStorePromotionRequestObj>({
    promotionId: Joi.string().required().label("Promotion ID"),
    name: Joi.string().required().label("Name"),
    startDate: Joi.date().required().label("Start Date"),
    endDate: Joi.date().required().label("End Date"),
    image: Joi.object({
      imageId: Joi.string().label("Image ID"),
      file: Joi.string()
        .pattern(
          /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+={0,2}|[A-Za-z0-9+/]+={0,2})$/
        ) // Base64 validation pattern
        .required()
        .label("File"),
      path: Joi.string().label("Path"),
      _id: Joi.string().label("_id"),
    })
      .required()
      .label("Image"),
  });

  return schema.validate(data);
};
