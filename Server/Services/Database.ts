import mongoose from "mongoose";
import { MONGODB_URI } from "../Config";

export default async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connected to database successfully");
  } catch (error) {
    console.log("could not connected to database");
    console.log(error);
    process.exit(1);
  }
};
