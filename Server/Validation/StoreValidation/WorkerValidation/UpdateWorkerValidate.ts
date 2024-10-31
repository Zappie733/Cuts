import Joi from "joi";
import { UpdateWorkerRequestObj } from "../../../dto/Worker";

export const UpdateWorkerValidate = (data: UpdateWorkerRequestObj) => {
  const schema = Joi.object<UpdateWorkerRequestObj>({
    workerId: Joi.string().required().label("Worker ID"),
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
