import Joi from "joi";
import { UpdateServiceRequestObj } from "../../../dto/Service";

export const UpdateServiceValidate = (data: UpdateServiceRequestObj) => {
  const schema = Joi.object<UpdateServiceRequestObj>({
    serviceId: Joi.string().required().label("Service ID"),
    name: Joi.string().required().label("Name"),
    price: Joi.number().required().label("Price"),
    duration: Joi.number().required().label("Duration"),
    description: Joi.string().label("Description"),
    serviceProduct: Joi.array().items(Joi.string()).label("Service Product"),
    discount: Joi.number().label("Discount"),
  });

  return schema.validate(data);
};
