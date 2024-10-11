import Joi from "joi";
import { StoreId } from "../../dto";

export const DeleteStoreValidate = (data: StoreId) => {
  const schema = Joi.object<StoreId>({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};
