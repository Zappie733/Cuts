import mongoose, { Schema } from "mongoose";
import { UserTokenObj } from "../dto/UserToken";

const UserTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    refreshToken: {
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
    expires: 30 * 86400, //30 days
  }
);

export const USERTOKEN = mongoose.model<UserTokenObj>(
  "UserTokens",
  UserTokenSchema
);
