import Joi from "joi";
import { AddOrderRequestObj } from "../../dto/Order";

export const AddOrderValidate = (data: AddOrderRequestObj) => {
  const schema = Joi.object<AddOrderRequestObj>({
    storeId: Joi.string().label("Store ID"),
    userName: Joi.string().label("User Name"),
    serviceIds: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required()
      .label("Service IDs"),
    chosenServiceProductsIds: Joi.array()
      .items(
        Joi.object({
          serviceId: Joi.string().required().label("Service ID"),
          serviceProductIds: Joi.array()
            .items(Joi.string())
            .required()
            .label("Service Product ID"),
        })
      )
      .label("Chosen Service Products IDs"),
    isManual: Joi.boolean().required().label("Is Manual"),
    totalPrice: Joi.number().required().label("Total Price"),
    totalDuration: Joi.number().required().label("Total Duration"),
    workerId: Joi.string().allow("").label("Worker ID"),
    date: Joi.date().label("Date"),
  });

  return schema.validate(data);
};
