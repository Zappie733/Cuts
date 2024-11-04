import { Request, Response } from "express";
import { GetServiceProductsByStoreIdResponse, ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";
import {
  AddServiceProductRequestObj,
  ServiceProductObj,
  UpdateServiceProductRequestObj,
} from "../dto/ServiceProduct";
import { AddServiceProductValidate } from "../Validation/StoreValidation/ServiceProductValidation/AddServiceProductValidate";
import mongoose from "mongoose";
import { UpdateServiceProductValidate } from "../Validation/StoreValidation/ServiceProductValidation/UpdateServiceProductValidate";

export const getServiceProductsByStoreId = async (
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
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };
      // console.log(payload);
      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
      const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

      const responseData: GetServiceProductsByStoreIdResponse = {
        serviceProducts: [],
        total: 0,
      };

      const store = await STORES.findOne({ userId: payload._id });
      // console.log(store);
      if (store) {
        const totalServiceProducts = store.serviceProducts.length;

        if (totalServiceProducts === 0) {
          return res.status(200).json(<
            ResponseObj<GetServiceProductsByStoreIdResponse>
          >{
            error: false,
            message: `${store.name} does not have any service products`,
            data: responseData,
          });
        }

        const paginatedServiceProducts = store.serviceProducts.slice(
          offset,
          offset + limit
        );

        responseData.serviceProducts = paginatedServiceProducts;
        responseData.total = totalServiceProducts;

        return res.status(200).json(<
          ResponseObj<GetServiceProductsByStoreIdResponse>
        >{
          error: false,
          message: `Service products of ${store.name} retrieved successfully`,
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

export const addServiceProduct = async (req: Request, res: Response) => {
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
      const { error } = AddServiceProductValidate(
        <AddServiceProductRequestObj>req.body
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

      const {
        name,
        quantity,
        alertQuantity,
        description,
        isAnOption,
        addtionalPrice,
      } = <AddServiceProductRequestObj>req.body;

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const serviceProductNameExist = store.serviceProducts.find(
        (serviceProduct) => serviceProduct.name === name
      );

      if (serviceProductNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Service product name is already exist",
        });
      }

      const newServiceProduct: ServiceProductObj = {
        name,
        quantity,
        alertQuantity,
        description,
        isAnOption,
        addtionalPrice,
      };

      store.serviceProducts.push(newServiceProduct);

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${newServiceProduct.name} has been added to store service products successfully`,
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

export const deleteServiceProduct = async (req: Request, res: Response) => {
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

      const { id: serviceProductIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(serviceProductIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service Product ID",
        });
      }

      const serviceProduct = store.serviceProducts.find(
        (serviceProduct) =>
          serviceProduct._id?.toString() === serviceProductIdParam.toString()
      );

      if (!serviceProduct) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Service product not found",
        });
      }

      store.serviceProducts = store.serviceProducts.filter(
        (serviceProductData) =>
          serviceProductData._id?.toString() !== serviceProduct._id?.toString()
      );

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${serviceProduct.name} has been deleted successfully`,
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

export const updateServiceProduct = async (req: Request, res: Response) => {
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

      const { error } = UpdateServiceProductValidate(
        <UpdateServiceProductRequestObj>req.body
      );

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const {
        serviceProductId,
        name,
        quantity,
        alertQuantity,
        description,
        isAnOption,
        addtionalPrice,
      }: UpdateServiceProductRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(serviceProductId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service Prodcuct ID",
        });
      }

      const serviceProduct = store.serviceProducts.find(
        (serviceProduct) =>
          serviceProduct._id?.toString() === serviceProductId.toString()
      );

      if (!serviceProduct) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Service product not found",
        });
      }

      const serviceProductNameExist = store.serviceProducts.find(
        (serviceProductData) =>
          serviceProductData.name === name &&
          serviceProductData._id !== serviceProduct._id
      );

      if (serviceProductNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Service product name is already exist",
        });
      }

      serviceProduct.name = name;
      serviceProduct.quantity = quantity;
      serviceProduct.alertQuantity = alertQuantity;
      serviceProduct.description = description;
      serviceProduct.isAnOption = isAnOption;
      serviceProduct.addtionalPrice = addtionalPrice;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Service product has been updated successfully`,
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
