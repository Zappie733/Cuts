import Joi from "joi";
import { ImageRequestObj } from "../../dto/Image";

export const UpdateUserImageValidate = (data: ImageRequestObj) => {
  const schema = Joi.object<ImageRequestObj>({
    file: Joi.string()
      .pattern(/^[A-Za-z0-9+/]+={0,2}$/)
      .required()
      .label("File"),
    // path: Joi.string().required().label("Path"),
  });
  return schema.validate(data);
};

/*
The file field is validated using a regular expression pattern that ensures the string is a Base64-encoded image with the typical data:image/...;base64,... format.

The pattern checks that the string starts with data:image/, followed by the image format (like png, jpeg, etc.), and contains a valid Base64 string after base64,.*/
