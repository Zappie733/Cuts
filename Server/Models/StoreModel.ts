import mongoose, { Schema } from "mongoose";
import { StoreObj } from "../dto/Store";

const StoreSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    images: [
      {
        imageId: {
          type: String,
        },
        file: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Waiting for Approval", "Rejected", "Active", "InActive", "Hold"],
      required: true,
      default: "Waiting for Approval",
    },
    location: {
      type: String,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    documents: [
      {
        documentId: {
          type: String,
        },
        name: {
          type: String,
        },
        file: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
    rejectedReason: {
      type: String,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    onHoldReason: {
      type: String,
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

export const STORES = mongoose.model<StoreObj>("Stores", StoreSchema);
