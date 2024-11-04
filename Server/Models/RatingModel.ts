import mongoose, { Schema } from "mongoose";
import { RatingObj } from "../dto/Rating";

const RatingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Stores",
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Services",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Orders",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
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

export const RATINGS = mongoose.model<RatingObj>("Ratings", RatingSchema);
