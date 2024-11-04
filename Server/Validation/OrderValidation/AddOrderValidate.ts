import Joi from "joi";
import { AddOrderRequestObj } from "../../dto/Order";

export const AddOrderValidate = (data: AddOrderRequestObj) => {
  const schema = Joi.object<AddOrderRequestObj>({
    storeId: Joi.string().label("Store ID"),
    serviceId: Joi.string().required().label("Service ID"),
    isManual: Joi.boolean().required().label("Is Manual"),
    totalPrice: Joi.number().required().label("Total Price"),
    workerId: Joi.string().label("Worker ID"),
  });

  return schema.validate(data);
};
