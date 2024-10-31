import mongoose, { Schema } from "mongoose";
import { OrderObj } from "../dto/Order";

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Stores",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
    isManual: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Waiting for Confirmation",
        "Waiting for Payment",
        "Paid",
        "Completed",
      ],
    },
    totalPrice: {
      type: Number,
      required: true,
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

export const ORDERS = mongoose.model<OrderObj>("Orders", OrderSchema);
