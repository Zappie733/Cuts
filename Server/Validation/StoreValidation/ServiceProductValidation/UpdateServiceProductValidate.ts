import Joi from "joi";
import { UpdateServiceProductRequestObj } from "../../../dto/ServiceProduct";

export const UpdateServiceProductValidate = (
  data: UpdateServiceProductRequestObj
) => {
  const schema = Joi.object<UpdateServiceProductRequestObj>({
    serviceProductId: Joi.string().required().label("Service Product ID"),
    name: Joi.string().required().label("Name"),
    quantity: Joi.number().required().label("Quantity"),
    alertQuantity: Joi.number().required().label("Alert Quantity"),
    description: Joi.string().label("Description"),
    isAnOption: Joi.boolean().required().label("Is An Option"),
    addtionalPrice: Joi.number().label("Addtional Price"),
  });

  return schema.validate(data);
};
