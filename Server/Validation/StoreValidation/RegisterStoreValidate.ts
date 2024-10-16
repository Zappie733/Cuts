/*************  ✨ Codeium Command 🌟  *************/
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
    userId: Joi.string().required().label("User ID"),
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
    storeImages: Joi.array()
      .items(
        Joi.object({
          file: Joi.string()
            .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
            .required()
            .label("File"),
          path: Joi.string().required().label("Path"),
        })
      )
      .required()
      .label("Store Image"),
    storeType: Joi.string()
      .valid("salon", "barbershop")
      .required()
      .label("Store Type")
      .messages({
        "any.only": "Store Type must be 'salon' or 'barbershop'.",
      }),
    storeName: Joi.string().required().label("Store Name"),

    storeLocation: Joi.string().required().label("Store Location"),
    storeDocuments: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().label("Name"),
          file: Joi.string()
            .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
            .required()
            .label("File"),
          path: Joi.string().required().label("Path"),
        })
      )
      .required()
      .label("Store Document"),
  });

  return schema.validate(data);
};
