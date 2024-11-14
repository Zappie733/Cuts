import Joi from "joi";
import { UpdateSalesProductRequestObj } from "../../../dto/SalesProduct";

export const UpdateSalesProductValidate = (
  data: UpdateSalesProductRequestObj
) => {
  const schema = Joi.object<UpdateSalesProductRequestObj>({
    salesProductId: Joi.string().required().label("Sales Product ID"),
    name: Joi.string().required().label("Name"),
    description: Joi.string().label("Description"),
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
    links: Joi.array().items(Joi.string()).required().label("Links"),
    price: Joi.number().required().label("Price"),
  });

  return schema.validate(data);
};
