import Joi from "joi";
import { UpdateServiceProductRequestObj } from "../../../dto/ServiceProduct";

export const UpdateServiceProductValidate = (
  data: UpdateServiceProductRequestObj
) => {
  const schema = Joi.object<UpdateServiceProductRequestObj>({
    serviceProductId: Joi.string().required().label("Service Product ID"),
    name: Joi.string().required().label("Name"),
    quantity: Joi.number().required().label("Quantity"),
    alertQuantity: Joi.number().required().label("Alert Quantity"),
    description: Joi.string().label("Description"),
    isAnOption: Joi.boolean().required().label("Is An Option"),
    addtionalPrice: Joi.number().label("Addtional Price"),
    image: Joi.object({
      imageId: Joi.string().label("Image ID"),
      file: Joi.string()
        .pattern(
          /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+={0,2}|[A-Za-z0-9+/]+={0,2})$/
        )
        .required()
        .label("File"),
      path: Joi.string().label("Path"),
      _id: Joi.string().label("_id"),
    })
      .required()
      .label("Image"),
  });

  return schema.validate(data);
};
