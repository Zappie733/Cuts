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
  });

  return schema.validate(data);
};
