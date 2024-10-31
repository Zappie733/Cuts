import { Request, Response } from "express";
import { GetServicesByStoreIdResponse, ResponseObj } from "../Response";
import {
  AddServiceRequestObj,
  PayloadObj,
  ServiceObj,
  UpdateServiceRequestObj,
} from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";
import { AddServiceValidate } from "../Validation/StoreValidation/ServiceValidation/AddServiceValidate";
import mongoose from "mongoose";
import { UpdateServiceValidate } from "../Validation/StoreValidation/ServiceValidation/UpdateServiceValidate";

export const getServicesByStoreId = async (req: Request, res: Response) => {
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
      const responseData: GetServicesByStoreIdResponse = {
        services: [],
      };

      const store = await STORES.findOne({ userId: payload._id });
      // console.log(store);
      if (store) {
        if (store.services.length === 0) {
          return res.status(200).json(<ResponseObj>{
            error: false,
            message: `${store.name} does not have any services`,
            data: responseData,
          });
        }

        responseData.services = store.services;

        return res.status(200).json(<ResponseObj<GetServicesByStoreIdResponse>>{
          error: false,
          message: `Services of ${store.name} retrieved successfully`,
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

export const addService = async (req: Request, res: Response) => {
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
      const { error } = AddServiceValidate(<AddServiceRequestObj>req.body);
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

      const { name, price, duration, description, serviceProduct } = <
        AddServiceRequestObj
      >req.body;

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const serviceNameExist = store.services.find(
        (service) => service.name === name
      );

      if (serviceNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Service name is already exist",
        });
      }

      for (const sp of serviceProduct ? serviceProduct : []) {
        if (!mongoose.Types.ObjectId.isValid(sp)) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: `Service product with id '${sp}' is Invalid`,
          });
        }

        const isServiceProductExist = store.serviceProducts.find(
          (serviceProduct) => serviceProduct._id?.toString() === sp.toString()
        );

        if (!isServiceProductExist) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: `Service product with id '${sp}' not found`,
          });
        }
      }

      const newService: ServiceObj = {
        name,
        price,
        duration,
        description,
        serviceProduct,
      };

      store.services.push(newService);

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${newService.name} has been added to store services successfully`,
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

export const deleteService = async (req: Request, res: Response) => {
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

      const { id: serviceIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(serviceIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service ID",
        });
      }

      const service = store.services.find(
        (service) => service._id?.toString() === serviceIdParam.toString()
      );

      if (!service) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Service not found" });
      }

      store.services = store.services.filter(
        (serviceData) => serviceData._id?.toString() !== service._id?.toString()
      );

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${service.name} has been deleted successfully`,
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

export const updateService = async (req: Request, res: Response) => {
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

      const { error } = UpdateServiceValidate(
        <UpdateServiceRequestObj>req.body
      );

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const {
        serviceId,
        name,
        price,
        duration,
        description,
        serviceProduct,
      }: UpdateServiceRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service ID",
        });
      }

      const service = store.services.find(
        (service) => service._id?.toString() === serviceId.toString()
      );

      if (!service) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Service not found" });
      }

      const serviceNameExist = store.services.find(
        (serviceData) =>
          serviceData.name === name && serviceData._id !== service._id
      );

      if (serviceNameExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Service name is already exist",
        });
      }

      for (const sp of serviceProduct ? serviceProduct : []) {
        if (!mongoose.Types.ObjectId.isValid(sp)) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: `Service product with id '${sp}' is Invalid`,
          });
        }

        const isServiceProductExist = store.serviceProducts.find(
          (serviceProduct) => serviceProduct._id?.toString() === sp.toString()
        );

        if (!isServiceProductExist) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: `Service product with id '${sp}' not found`,
          });
        }
      }

      service.name = name;
      service.price = price;
      service.duration = duration;
      service.description = description;
      service.serviceProduct = serviceProduct;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Service has been updated successfully`,
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
