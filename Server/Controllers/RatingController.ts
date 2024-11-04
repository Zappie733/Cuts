import { Request, Response } from "express";
import { ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { AddRatingRequestObj } from "../dto/Rating";
import { AddRatingValidate } from "../Validation/RatingValidation/AddRatingValidate";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import { ORDERS } from "../Models/OrderModel";
import { RATINGS } from "../Models/RatingModel";
import mongoose from "mongoose";
import {
  GetAllRatingByStoreIdAndServiceIdResponse,
  GetAllRatingByStoreIdResponse,
  GetRatingByOrderIdResponse,
} from "../Response/RatingResponse";

export const addRating = async (req: Request, res: Response) => {
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
      const { error } = AddRatingValidate(<AddRatingRequestObj>req.body);
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

      const { storeId, serviceId, orderId, rating, comment } = <
        AddRatingRequestObj
      >req.body;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }

      const isRatingExist = await RATINGS.findOne({
        orderId: orderId,
      });
      if (isRatingExist) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Rating is already exist",
        });
      }

      const user = await USERS.findOne({ _id: payload._id });
      if (!user) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "User not found" });
      }

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }
      const store = await STORES.findOne({ _id: storeId });
      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service ID",
        });
      }
      const service = await store.services.find(
        (service) => service._id?.toString() === serviceId.toString()
      );
      if (!service) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Service not found" });
      }

      const order = await ORDERS.findOne({ _id: orderId, status: "Completed" });

      if (!order) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Order not found or Order has not completed",
        });
      }

      const newRating = new RATINGS({
        userId: payload._id,
        storeId: storeId,
        serviceId: serviceId,
        orderId: orderId,
        rating: rating,
        comment: comment,
        date: new Date(Date.now() + 7 * 60 * 60 * 1000),
      });

      order.hasRating = true;

      await newRating.save();
      await order.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Rating has been added successfully`,
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

export const deleteRating = async (req: Request, res: Response) => {
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

      const user = await USERS.findOne({ _id: payload._id });
      if (!user) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "User not found" });
      }

      const { id: ratingIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(ratingIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Rating ID",
        });
      }

      const rating = await RATINGS.findOne({
        _id: ratingIdParam,
      });
      if (!rating) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Rating not found",
        });
      }

      await rating.deleteOne();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Rating (${rating._id}) has been deleted successfully`,
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

export const getAllRatingByStoreId = async (req: Request, res: Response) => {
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
      const { limit, offset } = req.query;

      const { id: storeIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(storeIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }
      const store = await STORES.findOne({ _id: storeIdParam });
      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const ratings = await RATINGS.find({ storeId: storeIdParam })
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetAllRatingByStoreIdResponse = {
        ratings: ratings,
        total: await RATINGS.countDocuments({ storeId: storeIdParam }),
      };

      return res.status(200).json(<ResponseObj<GetAllRatingByStoreIdResponse>>{
        error: false,
        message: `Rating of ${store.name} retrieved successfully`,
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

export const getAllRatingByStoreIdAndServiceId = async (
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
      const { limit, offset } = req.query;

      const { storeId: storeIdParam, serviceId: serviceIdParam } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }
      if (!mongoose.Types.ObjectId.isValid(serviceIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Service ID",
        });
      }
      const store = await STORES.findOne({ _id: storeIdParam });
      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }
      const service = store.services.find(
        (service) => service._id?.toString() === serviceIdParam.toString()
      );
      if (!service) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Service not found" });
      }

      const ratings = await RATINGS.find({
        storeId: storeIdParam,
        serviceId: serviceIdParam,
      })
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetAllRatingByStoreIdAndServiceIdResponse = {
        ratings: ratings,
        total: await RATINGS.countDocuments({
          storeId: storeIdParam,
          serviceId: serviceIdParam,
        }),
      };

      return res.status(200).json(<
        ResponseObj<GetAllRatingByStoreIdAndServiceIdResponse>
      >{
        error: false,
        message: `Rating of ${store.name} for ${service.name} retrieved successfully`,
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

export const getRatingByOrderId = async (req: Request, res: Response) => {
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
      const { id: orderIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(orderIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }
      const rating = await RATINGS.findOne({ orderId: orderIdParam });
      if (!rating) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Rating not found" });
      }

      return res.status(200).json(<ResponseObj<GetRatingByOrderIdResponse>>{
        error: false,
        message: `Rating retrieved successfully`,
        data: { rating },
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
