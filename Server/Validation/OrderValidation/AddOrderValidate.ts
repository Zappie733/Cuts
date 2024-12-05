import Joi from "joi";
import { AddOrderRequestObj } from "../../dto/Order";

export const AddOrderValidate = (data: AddOrderRequestObj) => {
  const schema = Joi.object<AddOrderRequestObj>({
    storeId: Joi.string().label("Store ID"),
    serviceIds: Joi.array().items(Joi.string()).required().label("Service IDs"),
    chosenServiceProductsIds: Joi.array()
      .items(Joi.string())
      .label("Chosen Service Products IDs"),
    isManual: Joi.boolean().required().label("Is Manual"),
    totalPrice: Joi.number().required().label("Total Price"),
    totalDuration: Joi.number().required().label("Total Duration"),
    workerId: Joi.string().label("Worker ID"),
    date: Joi.date().required().label("Date"),
    userName: Joi.string().label("User Name"),
  });

  return schema.validate(data);
};
