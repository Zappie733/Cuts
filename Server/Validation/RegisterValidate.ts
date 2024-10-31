import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import { UserObj } from "../dto/User";

export const RegisterValidate = (data: UserObj) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4, //Requires that the password meets at least 4 of the complexity requirements.
  };

  const schema = Joi.object<UserObj>({
    firstName: Joi.string().required().min(3).label("First Name"),
    lastName: Joi.string().required().min(3).label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: PasswordComplexity(complexityOptions)
      .required()
      .label("Password"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm Password")
      .messages({
        "any.only": "Confirm Password must match Password.",
      }),
    phone: Joi.string()
      .pattern(/^0\d{11}$/) // Matches a string starting with '0' followed by 11 digits
      .required()
      .label("Phone")
      .messages({
        "string.pattern.base":
          "Phone number must start with 0 and have 12 digits.",
      }),
    role: Joi.string().valid("user").required().label("Role").messages({
      "any.only": "Role must be one of ['user'].",
    }),
  });
  return schema.validate(data);
};
