import Joi from "joi";
import { AddServiceRequestObj } from "../../../dto/Service";

export const AddServiceValidate = (data: AddServiceRequestObj) => {
  const schema = Joi.object<AddServiceRequestObj>({
    name: Joi.string().required().label("Service Name"),
    price: Joi.number().required().label("Price"),
    duration: Joi.number().required().label("Duration"),
    description: Joi.string().label("Description"),
    serviceProduct: Joi.array().items(Joi.string()).label("Service Product"),
  });

  return schema.validate(data);
};
