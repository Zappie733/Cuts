import Joi from "joi";
import { AddServiceProductRequestObj } from "../../../dto/ServiceProduct";

export const AddServiceProductValidate = (
  data: AddServiceProductRequestObj
) => {
  const schema = Joi.object<AddServiceProductRequestObj>({
    name: Joi.string().required().label("Name"),
    quantity: Joi.number().required().label("Quantity"),
    alertQuantity: Joi.number().required().label("Alert Quantity"),
    description: Joi.string().label("Description"),
    isAnOption: Joi.boolean().required().label("Is An Option"),
    addtionalPrice: Joi.number().label("Addtional Price"),
    image: Joi.object({
      file: Joi.string()
        .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
        .required()
        .label("File"),
      // path: Joi.string().required().label("Path"),
    })
      .required()
      .label("Image"),
  });

  return schema.validate(data);
};
