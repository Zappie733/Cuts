import mongoose, { Schema } from "mongoose";
import { StoreObj } from "../dto/Store";
import { ServiceObj, WorkerObj } from "../dto";

export const WorkerSchema = new Schema<WorkerObj>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "worker"],
      required: true,
    },
    isOnDuty: {
      type: Boolean,
      default: false,
    },
    history: [
      {
        date: {
          type: Date,
        },
        clockIn: {
          type: Date,
        },
        clockOut: {
          type: Date,
        },
        isAbsence: {
          type: Boolean,
        },
        reason: {
          type: String,
        },
      },
    ],
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

export const ServiceSchema = new Schema<ServiceObj>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    serviceProduct: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceProducts",
      },
    ],
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
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    onHoldReason: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    rejectedDate: {
      type: Date,
    },
    onHoldDate: {
      type: Date,
    },
    unHoldDate: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    onHoldBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    unHoldBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    openHour: {
      type: Number,
      required: true,
    },
    openMinute: {
      type: Number,
      required: true,
    },
    closeHour: {
      type: Number,
      required: true,
    },
    closeMinute: {
      type: Number,
      required: true,
    },
    workers: [WorkerSchema],
    services: [ServiceSchema],
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
