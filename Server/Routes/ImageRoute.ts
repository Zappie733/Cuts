import express from "express";
import { uploadImageController } from "../Controllers/ImageController";

export const ImageRoute = express.Router();
ImageRoute.post("/uploadImage", uploadImageController);
