import Joi from "joi";
import { UpdateSalesProductRequestObj } from "../../../dto/SalesProduct";

export const UpdateSalesProductValidate = (
  data: UpdateSalesProductRequestObj
) => {
  const schema = Joi.object<UpdateSalesProductRequestObj>({
    salesProductId: Joi.string().required().label("Sales Product ID"),
    name: Joi.string().required().label("Sales Product Name"),
    description: Joi.string().label("Description"),
    images: Joi.array()
      .items(
        Joi.object({
          file: Joi.string()
            .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
            .required()
            .label("File"),
          path: Joi.string().required().label("Path"),
        })
      )
      .required()
      .label("Sales Product Images"),
    links: Joi.array().items(Joi.string()).required().label("Links"),
    price: Joi.number().required().label("Price"),
  });

  return schema.validate(data);
};
