import { Request, Response } from "express";
import { GetSalesProductsByStoreIdResponse, ResponseObj } from "../Response";
import { ImageRequestObj, PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import mongoose from "mongoose";
import { STORES } from "../Models/StoreModel";
import {
  AddSalesProductRequestObj,
  SalesProductObj,
  UpdateSalesProductRequestObj,
} from "../dto/SalesProduct";
import { AddSalesProductValidate } from "../Validation/StoreValidation/SalesProductValidation/AddSalesProductValidate";
import ImageKit from "imagekit";
import {
  IMAGEKIT_BASEURL,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
} from "../Config";
import { UpdateSalesProductValidate } from "../Validation/StoreValidation/SalesProductValidation/UpdateSalesProductValidate";

export const getSalesProductsByStoreId = async (
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
      // const payload = <PayloadObj>{
      //   _id: response.data?._id,
      //   role: response.data?.role,
      // };
      // console.log(payload);
      const { id: storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid store ID",
        });
      }

      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
      const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

      const responseData: GetSalesProductsByStoreIdResponse = {
        salesProducts: [],
        total: 0,
      };

      const store = await STORES.findOne({ _id: storeId });
      // console.log(store);
      if (store) {
        const totalSalesProduct = store.salesProducts.length;

        if (totalSalesProduct === 0) {
          return res.status(200).json(<
            ResponseObj<GetSalesProductsByStoreIdResponse>
          >{
            error: false,
            message: `${store.name} does not have any sales products`,
            data: responseData,
          });
        }

        const paginatedSalesProduct = store.salesProducts.slice(
          offset,
          offset + limit
        );

        responseData.salesProducts = paginatedSalesProduct;
        responseData.total = totalSalesProduct;

        return res.status(200).json(<
          ResponseObj<GetSalesProductsByStoreIdResponse>
        >{
          error: false,
          message: `Sales products of ${store.name} retrieved successfully`,
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

export const addSalesProduct = async (req: Request, res: Response) => {
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
      const { error } = AddSalesProductValidate(
        <AddSalesProductRequestObj>req.body
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

      const { name, description, images, links, price } = <
        AddSalesProductRequestObj
      >req.body;

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const salesProductNameExist = store.salesProducts.find(
        (salesProduct) => salesProduct.name.toLowerCase() === name.toLowerCase()
      );

      if (salesProductNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Sales product name is already exist",
        });
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      // Array to store the uploaded image URLs
      const uploadedImages: ImageRequestObj[] = [];

      const newSalesProduct: SalesProductObj = {
        name,
        description,
        images: uploadedImages,
        links,
        price,
      };

      store.salesProducts.push(newSalesProduct);

      await store.save();

      // Upload each image
      for (const [index, imageObj] of images.entries()) {
        const result = await imagekit.upload({
          file: imageObj.file, // base64 encoded string
          fileName: `${store.id}_Image_${name + " " + index}`, // Unique filename for each image
          folder: imageObj.path, // Folder to upload to in ImageKit
        });
        console.log(result);
        // Add the uploaded image URL to the array
        uploadedImages.push({
          imageId: result.fileId,
          file: result.url,
          path: imageObj.path,
        });
      }

      const newSalesProductData = store.salesProducts.find(
        (salesProductData) => salesProductData.name === newSalesProduct.name
      );
      console.log(newSalesProductData);
      if (newSalesProductData) newSalesProductData.images = uploadedImages;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${newSalesProduct.name} has been added to store sales products successfully`,
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

export const deleteSalesProductById = async (req: Request, res: Response) => {
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

      const { id: salesProductIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(salesProductIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Sales Product ID",
        });
      }

      const salesProduct = store.salesProducts.find(
        (salesProduct) =>
          salesProduct._id?.toString() === salesProductIdParam.toString()
      );

      if (!salesProduct) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Sales product not found",
        });
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      // Iterate through the images to delete them from ImageKit
      for (const imageObj of salesProduct.images) {
        if (imageObj.imageId) await imagekit.deleteFile(imageObj.imageId);
      }

      store.salesProducts = store.salesProducts.filter(
        (salesProductData) =>
          salesProductData._id?.toString() !== salesProduct._id?.toString()
      );

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${salesProduct.name} has been deleted successfully`,
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

export const updateSalesProduct = async (req: Request, res: Response) => {
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

      const { error } = UpdateSalesProductValidate(
        <UpdateSalesProductRequestObj>req.body
      );
      // console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const { salesProductId, name, description, images, links, price } = <
        UpdateSalesProductRequestObj
      >req.body;

      if (!mongoose.Types.ObjectId.isValid(salesProductId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Sales Prodcuct ID",
        });
      }

      const salesProduct = store.salesProducts.find(
        (salesProduct) =>
          salesProduct._id?.toString() === salesProductId.toString()
      );

      if (!salesProduct) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Sales product not found",
        });
      }

      const salesProductNameExist = store.salesProducts.find(
        (salesProduct) =>
          salesProduct.name.toLowerCase() === name.toLowerCase() &&
          salesProduct._id?.toString() !== salesProductId.toString()
      );

      if (salesProductNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Sales product name is already exist",
        });
      }

      salesProduct.name = name;
      salesProduct.description = description;
      salesProduct.links = links;
      salesProduct.price = price;

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      const imageIdsToKeep: any = [];

      for (const imageObj of images) {
        if (imageObj.imageId === undefined) {
          console.log("skipping keeping filter because imageId is undefined");
          continue;
        }

        const image = salesProduct.images.find(
          (imageData) => imageData.imageId === imageObj.imageId
        );

        if (image) {
          console.log("push imageId to imageIdsToKeep " + imageObj.imageId);
          imageIdsToKeep.push(imageObj.imageId);
        }
      }

      console.log(imageIdsToKeep);

      //delete images in imagekit that is not in imageIdsToKeep
      for (const imageObj of salesProduct.images) {
        if (imageObj.imageId) {
          if (!imageIdsToKeep.includes(imageObj.imageId)) {
            console.log("deleting image " + imageObj.imageId);
            await imagekit.deleteFile(imageObj.imageId);
          }
        }
      }

      //remove images from salesProduct that is not in imageIdsToKeep
      salesProduct.images = salesProduct.images.filter((imageData) =>
        imageIdsToKeep.includes(imageData.imageId)
      );

      console.log(salesProduct.images);
      await store.save();

      // Upload each new image
      for (const [index, imageObj] of images.entries()) {
        if (imageObj.imageId !== undefined) {
          console.log(`skipping upload for ${imageObj.imageId}`);
          continue;
        }

        const result = await imagekit.upload({
          file: imageObj.file, // base64 encoded string
          fileName: `${store.id}_Image_${name + " " + index}`, // Unique filename for each image
          folder: imageObj.path, // Folder to upload to in ImageKit
        });
        console.log(result);
        // Add the uploaded image URL to the array
        salesProduct.images.push({
          imageId: result.fileId,
          file: result.url,
          path: imageObj.path,
        });
      }

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Sales Product (${salesProduct.name}) has been updated successfully`,
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
