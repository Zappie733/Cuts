import Joi from "joi";
import { RefreshTokenObj } from "../dto";

export const RefreshTokenValidate = (data: RefreshTokenObj) => {
  const schema = Joi.object<RefreshTokenObj>({
    refreshToken: Joi.string().required().label("Refresh Token"),
  });
  return schema.validate(data);
};
