import { Response, Request } from "express";
import {
  GetGalleryByStoreIdResponse,
  GetMostLikesGalleryByStoreIdResponse,
  ResponseObj,
} from "../Response";
import { ImageRequestObj, PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";
import mongoose from "mongoose";
import { AddGalleryValidate } from "../Validation/StoreValidation/GalleryValidation/AddGalleryValidate";
import {
  AddGalleryRequestObj,
  GalleryObj,
  UpdateGalleryRequestObj,
} from "../dto/Gallery";
import ImageKit from "imagekit";
import {
  IMAGEKIT_BASEURL,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
} from "../Config";
import { UpdateGalleryValidate } from "../Validation/StoreValidation/GalleryValidation/UpdateGalleryValidate";
import { USERS } from "../Models/UserModel";

export const getGalleryByStoreId = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { id: storeIdParam } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeIdParam });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
      const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

      const responseData: GetGalleryByStoreIdResponse = {
        gallery: [],
        total: 0,
      };

      const totalStoreGallery = store.gallery.filter(
        (gallery) => gallery.isPublic
      ).length;

      if (totalStoreGallery === 0) {
        return res.status(200).json(<ResponseObj>{
          error: false,
          message: "Gallery is empty",
          data: responseData,
        });
      }

      const paginatedStoreGallery = store.gallery
        .filter((gallery) => gallery.isPublic)
        .slice(offset, offset + limit);

      responseData.gallery = paginatedStoreGallery;
      responseData.total = totalStoreGallery;

      return res.status(200).json(<ResponseObj<GetGalleryByStoreIdResponse>>{
        error: false,
        message: "Gallery fetched successfully",
        data: responseData,
      });
    }

    return res.status(401).json(<ResponseObj>{
      error: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};

export const getMostLikesGalleryByStoreId = async (
  req: Request,
  res: Response
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { id: storeIdParam } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeIdParam });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { quantity } = req.query;

      const responseData: GetMostLikesGalleryByStoreIdResponse = {
        gallery: [],
      };

      const totalStoreGallery = store.gallery.length;

      if (totalStoreGallery === 0) {
        return res.status(200).json(<
          ResponseObj<GetMostLikesGalleryByStoreIdResponse>
        >{
          error: false,
          message: "Gallery is empty",
          data: responseData,
        });
      }

      const quantityNum = parseInt(quantity as string, 10) || 5;

      const galleryWithMostLikes = store.gallery
        .filter((gallery) => gallery.isPublic)
        .sort((a, b) => {
          const likesA = a.likes || 0;
          const likesB = b.likes || 0;
          return likesB - likesA;
        })
        .slice(0, quantityNum);

      responseData.gallery = galleryWithMostLikes;

      return res.status(200).json(<
        ResponseObj<GetMostLikesGalleryByStoreIdResponse>
      >{
        error: false,
        message: "Most likes gallery fetched successfully",
        data: responseData,
      });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};

export const addGallery = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { error } = AddGalleryValidate(req.body);

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const { images, caption }: AddGalleryRequestObj = req.body;

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      const uploadedImages: ImageRequestObj[] = [];

      const newGallery: GalleryObj = {
        images: uploadedImages,
        caption,
        date: new Date(Date.now() + 7 * 60 * 60 * 1000),
        isPublic: false,
      };

      store.gallery.push(newGallery);

      await store.save();

      const gallery = store.gallery[store.gallery.length - 1];

      if (!gallery) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Gallery not found",
        });
      }

      // Upload each image
      for (const [index, imageObj] of images.entries()) {
        const result = await imagekit.upload({
          file: imageObj.file, // base64 encoded string
          fileName: `Image_${index}`, // Unique filename for each image
          folder: `Stores/${store.id}/Gallery/${gallery._id}`, // Folder to upload to in ImageKit
        });
        console.log(result);
        // Add the uploaded image URL to the array
        uploadedImages.push({
          imageId: result.fileId,
          file: result.url,
          path: `Stores/${store.id}/Gallery/${gallery._id}`,
        });
      }

      gallery.images = uploadedImages;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Gallery added successfully",
      });
    }

    return res.status(401).json(<ResponseObj>{
      error: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};

export const deleteGalleryById = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { id: galleryIdParam } = req.params;

      if (!mongoose.Types.ObjectId.isValid(galleryIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid gallery id",
        });
      }

      const gallery = store.gallery.find((gallery) => {
        return gallery._id?.toString() === galleryIdParam.toString();
      });

      if (!gallery) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Gallery not found",
        });
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });
      // Iterate through the images to delete them from ImageKit
      // for (const galleryObj of gallery.images) {
      //   if (galleryObj.imageId) await imagekit.deleteFile(galleryObj.imageId);
      // }
      await imagekit.deleteFolder(`Stores/${store.id}/Gallery/${gallery._id}`);

      store.gallery = store.gallery.filter(
        (galleryData) => galleryData._id?.toString() !== gallery._id?.toString()
      );

      await store.save();

      // Remove galleryId from all users' likes arrays
      await USERS.updateMany(
        { likes: galleryIdParam },
        { $pull: { likes: galleryIdParam } }
      );

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Gallery deleted successfully",
      });
    }

    return res.status(401).json(<ResponseObj>{
      error: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};

export const updateGallery = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { error } = UpdateGalleryValidate(req.body);

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const { galleryId, caption, isPublic }: UpdateGalleryRequestObj =
        req.body;

      if (!mongoose.Types.ObjectId.isValid(galleryId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid gallery id",
        });
      }

      const gallery = store.gallery.find((gallery) => {
        return gallery._id?.toString() === galleryId.toString();
      });

      if (!gallery) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Gallery not found",
        });
      }

      gallery.caption = caption;
      gallery.isPublic = isPublic;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Gallery updated successfully",
      });
    }

    return res.status(401).json(<ResponseObj>{
      error: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};

export const likeGalleryById = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const user = await USERS.findOne({ _id: payload._id });

      if (!user) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "User not found",
        });
      }

      const { id: galleryIdParam, storeId: storeIdParam } = req.params;

      const store = await STORES.findOne({ _id: storeIdParam });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(galleryIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid gallery id",
        });
      }

      const gallery = store.gallery.find((gallery) => {
        return gallery._id?.toString() === galleryIdParam.toString();
      });

      if (!gallery) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Gallery not found",
        });
      }

      if (gallery.likes || gallery.likes === 0) {
        if (user.likes?.includes(galleryIdParam.toString())) {
          gallery.likes--;
          user.likes = user.likes.filter(
            (id) => id.toString() !== galleryIdParam.toString()
          );
        } else {
          gallery.likes++;
          user.likes?.push(galleryIdParam);
        }
      }

      await user.save();
      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Gallery likes updated successfully",
      });
    }

    return res.status(401).json(<ResponseObj>{
      error: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};
