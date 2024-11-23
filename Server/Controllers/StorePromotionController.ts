import { Request, Response } from "express";
import {
  GetRecentStorePromotionsByStoreIdResponse,
  GetStorePromotionsByStoreIdResponse,
  ResponseObj,
} from "../Response";
import { ImageRequestObj, PayloadObj } from "../dto";
import mongoose from "mongoose";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";
import {
  AddStorePromotionRequestObj,
  StorePromotionObj,
  UpdateStorePromotionRequestObj,
} from "../dto/StorePromotion";
import {
  IMAGEKIT_BASEURL,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
} from "../Config";
import ImageKit from "imagekit";
import { AddStorePromotionValidate } from "../Validation/StoreValidation/StorePromotionValidation/AddStorePromotionValidate";
import { UpdateStorePromotionValidate } from "../Validation/StoreValidation/StorePromotionValidation/UpdateStorePromotionValidate";

export const getStorePromotionsByStoreId = async (
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
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { id: storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store ID",
        });
      }

      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
      const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

      const responseData: GetStorePromotionsByStoreIdResponse = {
        storePromotions: [],
        total: 0,
      };

      const store = await STORES.findOne({ _id: storeId });
      // console.log(store);
      if (store) {
        const totalStorePromotions = store.storePromotions.length;

        if (totalStorePromotions === 0) {
          return res.status(200).json(<
            ResponseObj<GetStorePromotionsByStoreIdResponse>
          >{
            error: false,
            message: `${store.name} does not have any promotions`,
            data: responseData,
          });
        }

        const paginatedStorePromotions = store.storePromotions.slice(
          offset,
          offset + limit
        );

        responseData.storePromotions = paginatedStorePromotions;
        responseData.total = totalStorePromotions;

        return res.status(200).json(<
          ResponseObj<GetStorePromotionsByStoreIdResponse>
        >{
          error: false,
          message: `Promotions of ${store.name} retrieved successfully`,
          data: responseData,
        });
      }

      return res
        .status(404)
        .json(<ResponseObj>{ error: true, message: "Store not found" });
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

export const getRecentStorePromotionsByStoreId = async (
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
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { id: storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });
      // console.log(store);
      if (store) {
        const totalStorePromotions = store.storePromotions.length;

        if (totalStorePromotions === 0) {
          return res.status(200).json(<ResponseObj>{
            error: false,
            message: `${store.name} does not have any recent promotions`,
            data: [],
          });
        }

        const today = new Date();
        const recentPromotions = store.storePromotions
          .filter(
            (promotion) =>
              promotion.endDate.getTime() >= today.getTime() &&
              promotion.startDate.getTime() <= today.getTime()
          )
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
          .slice(0, 5);

        const responseData: GetRecentStorePromotionsByStoreIdResponse = {
          storePromotions: recentPromotions,
        };

        return res.status(200).json(<
          ResponseObj<GetRecentStorePromotionsByStoreIdResponse>
        >{
          error: false,
          message: `Recent promotions of ${store.name} retrieved successfully`,
          data: responseData,
        });
      }

      return res
        .status(404)
        .json(<ResponseObj>{ error: true, message: "Store not found" });
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

export const addStorePromotion = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { error } = AddStorePromotionValidate(
        <AddStorePromotionRequestObj>req.body
      );
      // console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const { name, image, startDate, endDate } = <AddStorePromotionRequestObj>(
        req.body
      );

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const storePromotionNameExist = store.storePromotions.find(
        (storePromotion) =>
          storePromotion.name.toLowerCase() === name.toLowerCase()
      );

      if (storePromotionNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Store promotion name is already exist",
        });
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      const uploadedImage: ImageRequestObj = {
        imageId: "",
        file: "",
        path: "",
      };

      const newStorePromotion: StorePromotionObj = {
        name,
        image: uploadedImage,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };

      store.storePromotions.push(newStorePromotion);

      await store.save();

      const storePromotion = store.storePromotions.find(
        (storePromotion) => storePromotion.name === name
      );

      if (!storePromotion) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store promotion not found",
        });
      }

      const result = await imagekit.upload({
        file: image.file, // base64 encoded string
        fileName: `Image_${name}`, // Unique filename for each image
        folder: `Stores/${store.id}/Promotions/${storePromotion._id}`, // Folder to upload to in ImageKit
      });
      console.log(result);

      uploadedImage.imageId = result.fileId;
      uploadedImage.file = result.url;
      uploadedImage.path = `Stores/${store.id}/Promotions/${storePromotion._id}`;

      storePromotion.image = uploadedImage;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${newStorePromotion.name} has been added to store promotions successfully`,
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

export const deleteStorePromotionById = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
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
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const { id: storePromotionIdParam } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storePromotionIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store Promotion ID",
        });
      }

      const storePromotion = store.storePromotions.find(
        (storePromotion) =>
          storePromotion._id?.toString() === storePromotionIdParam.toString()
      );

      if (!storePromotion) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store promotion not found",
        });
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      // await imagekit.deleteFile(
      //   storePromotion.image.imageId ? storePromotion.image.imageId : ""
      // );

      await imagekit.deleteFolder(
        `Stores/${store.id}/Promotions/${storePromotion._id}`
      );

      store.storePromotions = store.storePromotions.filter(
        (storePromotion) =>
          storePromotion._id?.toString() !== storePromotionIdParam.toString()
      );

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${storePromotion.name} has been deleted successfully`,
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

export const updateStorePromotion = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const { error } = UpdateStorePromotionValidate(
        <UpdateStorePromotionRequestObj>req.body
      );
      // console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const { promotionId, name, startDate, endDate, image } = <
        UpdateStorePromotionRequestObj
      >req.body;

      if (!mongoose.Types.ObjectId.isValid(promotionId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store Promotion ID",
        });
      }

      const storePromotion = store.storePromotions.find(
        (storePromotion) =>
          storePromotion._id?.toString() === promotionId.toString()
      );

      if (!storePromotion) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store promotion not found",
        });
      }

      const storePromotionNameExist = store.storePromotions.find(
        (storePromotion) =>
          storePromotion.name.toLowerCase() === name.toLowerCase() &&
          storePromotion._id?.toString() !== promotionId.toString()
      );

      if (storePromotionNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Store promotion name is already exist",
        });
      }

      storePromotion.name = name;
      storePromotion.startDate = new Date(startDate);
      storePromotion.endDate = new Date(endDate);

      await store.save();

      if (!image.imageId) {
        const imagekit = new ImageKit({
          publicKey: IMAGEKIT_PUBLIC_KEY,
          privateKey: IMAGEKIT_PRIVATE_KEY,
          urlEndpoint: IMAGEKIT_BASEURL,
        });

        await imagekit.deleteFile(
          storePromotion.image.imageId ? storePromotion.image.imageId : ""
        );

        const uploadedImage: ImageRequestObj = {
          imageId: "",
          file: "",
          path: "",
        };

        const result = await imagekit.upload({
          file: image.file, // base64 encoded string
          fileName: `Image_${storePromotion.name}`, // Unique filename for each image
          folder: `Stores/${store.id}/Promotions/${storePromotion._id}`, // Folder to upload to in ImageKit
        });
        console.log(result);

        uploadedImage.imageId = result.fileId;
        uploadedImage.file = result.url;
        uploadedImage.path = `Stores/${store.id}/Promotions/${storePromotion._id}`;

        storePromotion.image = uploadedImage;

        await store.save();
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${storePromotion.name} has been updated successfully`,
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
