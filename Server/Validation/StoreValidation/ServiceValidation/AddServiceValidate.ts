import Joi from "joi";
import { AddServiceRequestObj } from "../../../dto/Service";

export const AddServiceValidate = (data: AddServiceRequestObj) => {
  const schema = Joi.object<AddServiceRequestObj>({
    name: Joi.string().required().label("Name"),
    price: Joi.number().required().label("Price"),
    duration: Joi.number().required().label("Duration"),
    description: Joi.string().label("Description"),
    serviceProduct: Joi.array().items(Joi.string()).label("Service Product"),
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
      .label("Images"),
  });

  return schema.validate(data);
};
