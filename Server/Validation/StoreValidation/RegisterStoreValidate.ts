import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";
import { RegisterStoreRequestObj } from "../../dto/Store";

export const RegisterStoreValidate = (data: RegisterStoreRequestObj) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4, // Requires that the password meets at least 4 of the complexity requirements.
  };

  const schema = Joi.object<RegisterStoreRequestObj>({
    userId: Joi.string().required().label("Store Name"),
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
    role: Joi.string().valid("store").required().label("Role").messages({
      "any.only": "Role must be 'store'.",
    }),
    storeImages: Joi.object({
      file: Joi.string()
        .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
        .required()
        .label("File"),
      path: Joi.string().required().label("Path"),
    })
      .required()
      .label("Store Image"),
    storeName: Joi.string().required().label("Store Name"),
    storeType: Joi.string().required().label("Store Type"),
    storeLocation: Joi.string().required().label("Store Location"),
  });

  return schema.validate(data);
};
