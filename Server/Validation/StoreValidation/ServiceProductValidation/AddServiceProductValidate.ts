import Joi from "joi";
import { AddServiceProductRequestObj } from "../../../dto/ServiceProduct";

export const AddServiceProductValidate = (
  data: AddServiceProductRequestObj
) => {
  const schema = Joi.object<AddServiceProductRequestObj>({
    name: Joi.string().required().label("Service Product Name"),
    quantity: Joi.number().required().label("Quantity"),
    alertQuantity: Joi.number().required().label("Alert Quantity"),
    description: Joi.string().label("Description"),
    isAnOption: Joi.boolean().required().label("Is An Option"),
    addtionalPrice: Joi.number().label("Addtional Price"),
  });

  return schema.validate(data);
};
