import mongoose, { Schema } from "mongoose";
import { OrderHistoryObj } from "../dto/OrderHistory";

const OrderHistorySchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Stores",
      required: true,
    },
    services: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Services",
        },
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
        duration: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        serviceProducts: [
          {
            id: {
              type: Schema.Types.ObjectId,
              ref: "ServiceProducts",
            },
            name: {
              type: String,
            },
            addtionalPrice: {
              type: Number,
            },
          },
        ],
      },
    ],
    isManual: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ["Rejected", "Paid", "Completed"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    hasRating: {
      type: Boolean,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Workers",
      required: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    rejectedReason: {
      type: String,
    },
    timeDifference: {
      type: Number,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        //delete ret.createdAt;
        //delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

export const ORDERHISTORY = mongoose.model<OrderHistoryObj>(
  "OrderHistory",
  OrderHistorySchema
);
