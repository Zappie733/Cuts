import Joi from "joi";
import { UpdateUserParams } from "../dto/User";

export const UpdateUserValidate = (data: UpdateUserParams) => {
  const schema = Joi.object<UpdateUserParams>({
    firstName: Joi.string().required().min(3).label("First Name"),
    lastName: Joi.string().required().min(3).label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.string()
      .pattern(/^0\d{11}$/)
      .required()
      .label("Phone")
      .messages({
        "string.pattern.base":
          "Phone number must start with 0 and have 12 digits.",
      }),
  });
  return schema.validate(data);
};
