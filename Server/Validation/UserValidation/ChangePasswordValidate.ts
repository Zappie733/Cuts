import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import { AuthUser } from "../../dto/User";

export const ChangePasswordValidate = (data: AuthUser) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4, //Requires that the password meets at least 4 of the complexity requirements.
  };
  const schema = Joi.object<AuthUser>({
    email: Joi.string().email().required().label("Email"),
    password: PasswordComplexity(complexityOptions)
      .required()
      .label("Password"),
  });
  return schema.validate(data);
};
