import Joi from "joi";
import { RejectOrderRequestObj } from "../../dto/Order";

export const RejectOrderValidate = (data: RejectOrderRequestObj) => {
  const schema = Joi.object<RejectOrderRequestObj>({
    orderId: Joi.string().required().label("Order ID"),
    rejectedReason: Joi.string().required().label("Rejected Reason"),
  });

  return schema.validate(data);
};
