import Joi from "joi";
import { AuthUser } from "../dto/Users";

export const LoginValidate = (data: AuthUser) => {
  const schema = Joi.object<AuthUser>({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};
