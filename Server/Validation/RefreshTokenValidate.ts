import Joi from "joi";
import { RefreshToken } from "../dto";

export const RefreshTokenValidate = (data: RefreshToken) => {
  const schema = Joi.object<RefreshToken>({
    refreshToken: Joi.string().required().label("Refresh Token"),
  });
  return schema.validate(data);
};
