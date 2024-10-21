import Joi from "joi";
import { OnHoldStoreRequestObj } from "../../dto";

export const OnHoldStoreValidate = (data: OnHoldStoreRequestObj) => {
  const schema = Joi.object<OnHoldStoreRequestObj>({
    storeId: Joi.string().required().label("Store ID"),
    onHoldReason: Joi.string().required().label("On Hold Reason"),
  });
  return schema.validate(data);
};
