import Joi from "joi";
import { DeleteStoreRequestObj } from "../../dto";

export const DeleteStoreValidate = (data: DeleteStoreRequestObj) => {
  const schema = Joi.object<DeleteStoreRequestObj>({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};
