import Joi from "joi";
import { RegisterWorkerRequestObj } from "../../../dto/Worker";

export const RegisterWorkerValidate = (data: RegisterWorkerRequestObj) => {
  const schema = Joi.object<RegisterWorkerRequestObj>({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    age: Joi.number().required().label("Age"),
    email: Joi.string().email().required().label("Email"),
    role: Joi.string()
      .valid("admin", "worker")
      .required()
      .label("Role")
      .messages({
        "any.only": "Role must be 'admin' or 'worker'.",
      }),
    image: Joi.object({
      file: Joi.string()
        .pattern(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 validation pattern
        .required()
        .label("File"),
      path: Joi.string().required().label("Path"),
    })
      .required()
      .label("Image"),
  });

  return schema.validate(data);
};
