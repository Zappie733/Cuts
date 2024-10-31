import { Request, Response } from "express";
import { ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { AddOrderValidate } from "../Validation/AddOrderValidate";
import { AddOrderRequestObj, OrderObj } from "../dto/Order";
import { STORES } from "../Models/StoreModel";
import { USERS } from "../Models/UserModel";
import { ORDERS } from "../Models/OrderModel";
import mongoose from "mongoose";
import {
  GetOrderforScheduleResponse,
  GetOrdersByStatusResponse,
  GetStoreOrderHistoryResponse,
  OrderSummary,
} from "../Response/OrderResponse";

export const addOrder = async (req: Request, res: Response) => {
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
      const { error } = AddOrderValidate(<AddOrderRequestObj>req.body);
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

      const { storeId, serviceId, isManual, totalPrice } = <AddOrderRequestObj>(
        req.body
      );

      if (isManual) {
        const store = await STORES.findOne({ userId: payload._id });
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

        const service = store.services.find(
          (service) => service._id?.toString() === serviceId.toString()
        );
        if (!service) {
          return res
            .status(404)
            .json(<ResponseObj>{ error: true, message: "Service not found" });
        }

        const newOrder = new ORDERS({
          storeId: store._id,
          serviceId,
          isManual,
          totalPrice,
          date: new Date(Date.now() + 7 * 60 * 60 * 1000),
        });

        await newOrder.save();

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Order has been added successfully (manual order)`,
        });
      } else {
        const user = await USERS.findById(payload._id);
        if (!user) {
          return res
            .status(404)
            .json(<ResponseObj>{ error: true, message: "User not found" });
        }

        if (!mongoose.Types.ObjectId.isValid(storeId ? storeId : "")) {
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

        const service = store.services.find(
          (service) => service._id?.toString() === serviceId.toString()
        );
        if (!service) {
          return res
            .status(404)
            .json(<ResponseObj>{ error: true, message: "Service not found" });
        }

        const newOrder = new ORDERS({
          storeId,
          serviceId: service._id,
          isManual: false,
          totalPrice,
          date: new Date(Date.now() + 7 * 60 * 60 * 1000),
          status: "Waiting for Confirmation",
          userId: payload._id,
        });

        await newOrder.save();

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: "Order has been added successfully (automatic order)",
        });
      }
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

export const getOrdersByStatus = async (req: Request, res: Response) => {
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
      const { limit, offset, status } = req.query;

      let query: any = {};

      if (status) {
        if (
          status !== "Waiting for Confirmation" &&
          status !== "Waiting for Payment" &&
          status !== "Paid" &&
          status !== "Completed"
        ) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid status",
          });
        } else {
          query.status = status;
        }
      }

      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      if (payload.role === "user") {
        query.userId = payload._id;
      } else if (payload.role === "store") {
        const store = await STORES.findOne({ userId: payload._id });
        if (!store) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: "Store not found",
          });
        }

        query.storeId = store._id;
      }

      const orders = await ORDERS.find(query)
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetOrdersByStatusResponse = {
        orders: [],
        total: 0,
      };

      responseData.orders = orders;
      responseData.total = await ORDERS.countDocuments(query);

      return res.status(200).json(<ResponseObj<GetOrdersByStatusResponse>>{
        error: false,
        message: "Orders retrieved successfully",
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

export const getStoreOrderHistory = async (req: Request, res: Response) => {
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
      const month = req.query.month
        ? parseInt(req.query.month as string, 10)
        : undefined;
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : new Date().getFullYear(); // Default to current year if not provided
      let query: any = {};

      if (month !== undefined && year) {
        if (month < 1 || month > 12 || month === 0) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid Month (must be between 1 and 12)",
          });
        } else {
          const startDate = new Date(year, month - 1, 1); // Start of the month
          const endDate = new Date(year, month, 1); // Start of the next month

          query.date = {
            $gte: startDate,
            $lt: endDate,
          };
        }
      }

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

      query.storeId = store._id;

      query.status = { $in: ["Completed", undefined] };

      const orders = await ORDERS.find(query)
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetStoreOrderHistoryResponse = {
        orders: [],
        total: 0,
        summary: [],
      };

      responseData.orders = orders;
      responseData.total = await ORDERS.countDocuments(query);

      const summaryMap: { [key: string]: number } = {};
      for (const order of orders) {
        const service = store.services.find(
          (service) => service._id?.toString() === order.serviceId.toString()
        );

        if (service) {
          const serviceName = service.name;
          if (summaryMap[serviceName]) {
            summaryMap[serviceName]++;
          } else {
            summaryMap[serviceName] = 1;
          }
        }
      }

      // Convert summaryMap to an array of Summary objects
      //object.entries will change obj into array, like {a: 1, b: 2} => [['a', 1], ['b', 2]]
      //.map will destructure the array, the first as serviceName and the second as total, last the obj will use the destructed value to make an obj that contains serviceName and total
      responseData.summary = Object.entries(summaryMap).map(
        ([serviceName, total]) =>
          <OrderSummary>{
            serviceName,
            total,
          }
      );

      return res.status(200).json(<ResponseObj<GetStoreOrderHistoryResponse>>{
        error: false,
        message: `${store.name} order history retrieved successfully`,
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

export const getOrderforSchedule = async (req: Request, res: Response) => {
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

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Set to start of today in UTC
      console.log(today);
      console.log(today.toISOString()); // For logging in ISO format

      const nextSixDays = new Date();
      nextSixDays.setDate(today.getDate() + 6);
      nextSixDays.setUTCHours(23, 59, 59, 999); // Set to end of next week in UTC
      console.log(nextSixDays);
      console.log(nextSixDays.toISOString()); // For logging in ISO format

      let query: any = {
        date: {
          $gte: today,
          $lt: nextSixDays,
        },
      };

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

      query.storeId = store._id;

      query.status = { $in: ["Paid", "Completed", undefined] };

      const orders = await ORDERS.find(query)
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetOrderforScheduleResponse = {
        orders: [],
        total: 0,
      };

      responseData.orders = orders;
      responseData.total = await ORDERS.countDocuments(query);

      return res.status(200).json(<ResponseObj<GetOrderforScheduleResponse>>{
        error: false,
        message: `${store.name} schedule retrieved successfully`,
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
