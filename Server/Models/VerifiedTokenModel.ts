import mongoose, { Schema } from "mongoose";
import { VerifiedTokenObj } from "../dto/VerifiedToken";

const VerifiedTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },
    token: {
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
    expires: 60 * 10, //10m
  }
);

export const VERIFIEDTOKENS = mongoose.model<VerifiedTokenObj>(
  "VerifiedTokens",
  VerifiedTokenSchema
);
