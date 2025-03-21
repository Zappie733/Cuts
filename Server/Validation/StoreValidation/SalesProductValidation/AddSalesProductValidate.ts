import Joi from "joi";
import { AddSalesProductRequestObj } from "../../../dto/SalesProduct";

export const AddSalesProductValidate = (data: AddSalesProductRequestObj) => {
  const schema = Joi.object<AddSalesProductRequestObj>({
    name: Joi.string().required().label("Name"),
    description: Joi.string().label("Description"),
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
    links: Joi.array()
      .items(
        Joi.object({
          label: Joi.string().required(),
          link: Joi.string().required(),
        })
      )
      .min(1)
      .required()
      .label("Links"),
    price: Joi.number().required().label("Price"),
  });

  return schema.validate(data);
};
