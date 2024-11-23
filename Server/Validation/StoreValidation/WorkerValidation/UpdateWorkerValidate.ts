import Joi from "joi";
import { UpdateWorkerRequestObj } from "../../../dto/Worker";

export const UpdateWorkerValidate = (data: UpdateWorkerRequestObj) => {
  const schema = Joi.object<UpdateWorkerRequestObj>({
    workerId: Joi.string().required().label("Worker ID"),
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    age: Joi.number().required().label("Age"),
    role: Joi.string()
      .valid("admin", "worker")
      .required()
      .label("Role")
      .messages({
        "any.only": "Role must be 'admin' or 'worker'.",
      }),
    image: Joi.object({
      imageId: Joi.string().label("Image ID"),
      file: Joi.string()
        .pattern(
          /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+={0,2}|[A-Za-z0-9+/]+={0,2})$/
        )
        .required()
        .label("File"),
      // path: Joi.string().required().label("Path"),
    })
      .required()
      .label("Image"),
  });

  return schema.validate(data);
};
