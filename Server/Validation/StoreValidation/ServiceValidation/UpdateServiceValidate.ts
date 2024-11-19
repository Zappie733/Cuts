import Joi from "joi";
import { UpdateServiceRequestObj } from "../../../dto/Service";

export const UpdateServiceValidate = (data: UpdateServiceRequestObj) => {
  const schema = Joi.object<UpdateServiceRequestObj>({
    serviceId: Joi.string().required().label("Service ID"),
    name: Joi.string().required().label("Name"),
    price: Joi.number().required().label("Price"),
    duration: Joi.number().required().label("Duration"),
    description: Joi.string().label("Description"),
    serviceProduct: Joi.array().items(Joi.string()).label("Service Product"),
    discount: Joi.number().label("Discount"),
    images: Joi.array()
      .items(
        Joi.object({
          imageId: Joi.string().label("Image ID"),
          file: Joi.string()
            .pattern(
              /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+={0,2}|[A-Za-z0-9+/]+={0,2})$/
            )
            .required()
            .label("File"),
          path: Joi.string().required().label("Path"),
        })
      )
      .required()
      .label("Images"),
  });

  return schema.validate(data);
};
