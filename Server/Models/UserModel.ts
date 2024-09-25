import mongoose, { Schema } from "mongoose";
import { UserObj } from "../dto/Users";
import jwt from "jsonwebtoken";
import { JWTPRIVATEKEY } from "../Config";

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
    role: {
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
  if (!token) {
    return {};
  }
  return token;
};

export const USERS = mongoose.model<UserObj>("users", UserSchema);
