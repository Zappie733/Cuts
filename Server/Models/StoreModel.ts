import mongoose, { Schema } from "mongoose";
import { StoreObj } from "../dto/Store";

//image done
export const WorkerSchema = new Schema(
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
    image: {
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
//image done
export const ServiceSchema = new Schema(
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
    },
    serviceProduct: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceProducts",
      },
    ],
    discount: {
      type: Number,
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
//image done
export const ServiceProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    alertQuantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    isAnOption: {
      type: Boolean,
      required: true,
    },
    addtionalPrice: {
      type: Number,
    },
    image: {
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
    isAlerted: {
      type: Boolean,
      default: false,
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
//image done
export const SalesProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
    price: {
      type: Number,
      required: true,
    },
    links: {
      type: [String],
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
//image done
export const StorePromotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
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
//image done
export const GallerySchema = new Schema(
  {
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
    caption: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
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
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          required: true
        },
        coordinates: [Number]
      }
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
    canChooseWorker: {
      type: Boolean,
      required: true,
      default: false,
    },
    workers: [WorkerSchema],
    services: [ServiceSchema],
    serviceProducts: [ServiceProductSchema],
    salesProducts: [SalesProductSchema],
    storePromotions: [StorePromotionSchema],
    gallery: [GallerySchema],
    toleranceTime: {
      type: Number,
      required: true,
      default: 10,
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

StoreSchema.index({ "location.coordinates": "2dsphere" });

export const STORES = mongoose.model<StoreObj>("Stores", StoreSchema);
