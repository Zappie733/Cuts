import mongoose, { Schema } from "mongoose";
import { UserObj } from "../dto/User"; // Assuming UserObj is still imported from a separate file

// Define the UserObj schema
const UserSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
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
    },
    role: {
      type: String,
      enum: ["admin", "user", "store"], // Restrict role to "admin", "user", or "store"
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
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
    userId: {
      type: Schema.Types.ObjectId, // Relevant for users with the "store" role
      ref: "Users",
    },
    // Define the pendingStoreData inline with the schema
    pendingStoreData: {
      type: {
        storeImages: [
          {
            file: {
              type: String,
              required: true,
            },
            path: {
              type: String,
            },
          },
        ],
        storeName: {
          type: String,
        },
        storeType: {
          type: String,
          enum: ["salon", "barbershop"], // Restrict storeType to "Salon" or "Barbershop"
        },
        storeLocation: {
          type: String,
        },
        storeDocuments: [
          {
            name: {
              type: String,
              required: true,
            },
            file: {
              type: String,
              required: true,
            },
            path: {
              type: String,
            },
          },
        ],
      },
    },
    likes: [
      {
        storeId: {
          type: Schema.Types.ObjectId,
          ref: "Stores",
        },
        imageId: {
          type: Schema.Types.ObjectId,
          ref: "Gallery",
        },
        imageFiles: {
          type: [String],
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
        delete ret.password; // Ensure password is not exposed in JSON
      },
    },
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Export the User model
export const USERS = mongoose.model<UserObj>("Users", UserSchema);
