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
  });

  return schema.validate(data);
};
