import Joi from "joi";
import { AddRatingRequestObj } from "../../dto/Rating";

export const AddRatingValidate = (data: AddRatingRequestObj) => {
  const schema = Joi.object<AddRatingRequestObj>({
    storeId: Joi.string().required().label("Store ID"),
    serviceId: Joi.string().required().label("Service ID"),
    orderId: Joi.string().required().label("Order ID"),
    rating: Joi.number().integer().min(1).max(5).required().label("Rating"),
    comment: Joi.string().label("Comment"),
  });

  return schema.validate(data);
};
