import Joi from "joi";
import { RejectStoreRequestObj } from "../../dto";

export const RejectStoreValidate = (data: RejectStoreRequestObj) => {
  const schema = Joi.object<RejectStoreRequestObj>({
    storeId: Joi.string().required().label("Store ID"),
    rejectedReason: Joi.string().required().label("Rejected Reason"),
  });
  return schema.validate(data);
};
