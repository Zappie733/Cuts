import mongoose, { Schema } from "mongoose";
import { UserObj } from "../dto/Users";
import jwt from "jsonwebtoken";
import { JWTPRIVATEKEY } from "../Config";
import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id }, JWTPRIVATEKEY, { expiresIn: "1d" });
  return token;
};

export const USERS = mongoose.model<UserObj>("users", UserSchema);

export const validateUser = (data: UserObj) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4, //Requires that the password meets at least 4 of the complexity requirements.
  };

  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: PasswordComplexity(complexityOptions)
      .required()
      .label("Password"),
    phone: Joi.string()
      .pattern(/^0\d{11}$/) // Matches a string starting with '0' followed by 11 digits
      .required()
      .label("Phone")
      .messages({
        "string.pattern.base":
          "Phone number must start with 0 and have 12 digits.",
      }),
  });
  return schema.validate(data);
};
