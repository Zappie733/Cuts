import { Request, Response } from "express";
import { ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { AddOrderValidate } from "../Validation/OrderValidation/AddOrderValidate";
import {
  AddOrderRequestObj,
  OrderObj,
  RejectOrderRequestObj,
} from "../dto/Order";
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
import { RejectOrderValidate } from "../Validation/OrderValidation/RejectOrderValidate";
import { sendEmail } from "../Utils/UserUtil";

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

      const {
        storeId,
        serviceIds,
        isManual,
        totalPrice,
        totalDuration,
        workerId,
        date,
        chosenServiceProductsIds,
        userName,
      } = <AddOrderRequestObj>req.body;

      //check storeId Validity
      if (!isManual && storeId) {
        if (!mongoose.Types.ObjectId.isValid(storeId ? storeId : "")) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid Store ID",
          });
        }
      }

      const storeQuery = isManual
        ? { userId: payload._id, status: "Active" }
        : { _id: storeId, status: "Active" };

      const store = await STORES.findOne(storeQuery);

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found or not Active",
        });
      }

      const currentTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
      let startTime = new Date(date || Date.now() + 7 * 60 * 60 * 1000); //date itu dari frontend yang sudah di + 7, || itu untuk yang manual yang langsung (tidak untuk masa depan)
      let endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);
      console.log("currentTime: ", currentTime);
      console.log("startTime: ", startTime);
      console.log("endTime: ", endTime);
      console.log("startTime.getHours(): ", startTime.getHours());
      console.log("startTime.getUTCHours(): ", startTime.getUTCHours());

      //check whether the shop is still open
      if (
        startTime.getUTCHours() * 60 + startTime.getUTCMinutes() <
          store.openHour * 60 + store.openMinute ||
        endTime.getUTCHours() * 60 + endTime.getUTCMinutes() >
          store.closeHour * 60 + store.closeMinute ||
        store.isOpen === false
      ) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Cannot add order, Store is close",
        });
      }

      //check order date, can not be less than current time
      if (startTime < currentTime) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message:
            "Cannot add order for past. Date and Time cannot be less than now",
        });
      }

      //check order date, can only order for the next 7 days
      if (startTime > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Cannot add order for more than 7 days",
        });
      }

      let longestAvailableWorkerId: string | undefined = "";
      let longestAvailableTime: Date | undefined = undefined;

      if (workerId && workerId !== "") {
        console.log(workerId);
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid Worker ID",
          });
        }

        //check whether the store allows to choose worker or not
        if (!store.canChooseWorker) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Store cannot choose worker",
          });
        }

        const worker = store.workers.find(
          (worker) =>
            worker._id?.toString() === workerId.toString() &&
            worker.role === "worker"
        );
        if (!worker) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: "Worker not found",
          });
        }

        // check if worker is on duty
        if (!worker.isOnDuty) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Worker is not on duty",
          });
        }

        // Check if there are any conflicting orders
        const conflictingOrder = await ORDERS.findOne({
          storeId: store._id,
          workerId: workerId,
          status: {
            $in: [
              undefined,
              "Waiting for Confirmation",
              "Waiting for Payment",
              "Paid",
              "Completed",
            ],
          },
          $or: [
            { date: { $lte: endTime }, endTime: { $gte: startTime } },
            { date: { $lte: startTime }, endTime: { $gte: endTime } },
            { date: { $gte: startTime, $lte: endTime } },
          ],
        });
        console.log("conflictingOrder: " + conflictingOrder);
        if (conflictingOrder) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message:
              "Sorry your order failed, Order time conflicts with an existing order of your chosen worker",
          });
        }
      } else {
        const conflictingOrders = await ORDERS.find({
          storeId: store._id,
          status: {
            $in: [
              undefined,
              "Waiting for Confirmation",
              "Waiting for Payment",
              "Paid",
              "Completed",
            ],
          },
          $or: [
            { date: { $lte: endTime }, endTime: { $gte: startTime } },
            { date: { $lte: startTime }, endTime: { $gte: endTime } },
            { date: { $gte: startTime, $lte: endTime } },
          ],
        });

        //store workers
        const workersId = store.workers
          .filter(
            (worker) => worker.role === "worker" && worker.isOnDuty === true
          )
          .map((worker) => worker._id?.toString());

        // Collect the IDs of workers who have a conflicting order
        const busyWorkers = new Set(
          conflictingOrders.map((order) => order.workerId?.toString())
        );

        // If all workers are busy, return an error
        if (workersId.every((id) => busyWorkers.has(id))) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message:
              "Sorry your order failed, All the workers are busy at your order time.",
          });
        }

        //get available workers
        const availableWorkers = workersId.filter((id) => !busyWorkers.has(id));
        console.log("availableWorkers: " + availableWorkers);

        //get the longest available worker
        for (const availableWorkerId of availableWorkers) {
          //get worker's last order
          const lastOrder = await ORDERS.findOne({
            storeId: store._id,
            workerId: availableWorkerId,
            status: {
              $in: [undefined, "Paid", "Completed"],
            },
          }).sort({ createdAt: -1 });
          console.log("lastOrder: " + lastOrder);

          if (!lastOrder) {
            console.log("worker first order");
            longestAvailableWorkerId = availableWorkerId;
            break;
          } else {
            console.log("worker has order");
            if (longestAvailableTime === undefined) {
              console.log("first");
              longestAvailableTime = lastOrder.endTime;
              longestAvailableWorkerId = availableWorkerId;
            } else if (lastOrder.endTime < longestAvailableTime) {
              console.log("change");
              longestAvailableTime = lastOrder.endTime;
              longestAvailableWorkerId = availableWorkerId;
            }
          }
        }
      }

      //user store untuk send email alert quantity email
      const user = await USERS.findOne({ _id: store.userId });

      //check whether all the needed services are available
      for (const serviceId of serviceIds) {
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid Service ID " + serviceId,
          });
        }

        const service = store.services.find(
          (service) => service._id?.toString() === serviceId.toString()
        );
        if (!service) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: "Service not found " + serviceId,
          });
        }

        if (service.serviceProduct) {
          const allServiceProductIds = service.serviceProduct;
          console.log("All Service Products Ids: " + allServiceProductIds);

          for (const serviceProductId of allServiceProductIds) {
            const serviceProduct = store.serviceProducts.find(
              (serviceProduct) =>
                serviceProduct._id?.toString() === serviceProductId.toString()
            );

            if (
              serviceProduct &&
              (serviceProduct.isAnOption === false ||
                chosenServiceProductsIds
                  ?.find(
                    (obj) => obj.serviceId.toString() === serviceId.toString()
                  )
                  ?.serviceProductIds.includes(
                    serviceProduct._id?.toString() ?? ""
                  ))
            ) {
              if (!mongoose.Types.ObjectId.isValid(serviceProductId)) {
                return res.status(400).json(<ResponseObj>{
                  error: true,
                  message: "Invalid Service Product ID " + serviceProductId,
                });
              }

              if (serviceProduct.quantity === 0) {
                return res.status(400).json(<ResponseObj>{
                  error: true,
                  message: `Service Product (${serviceProduct.name}) is out of stock `,
                });
              } else if (serviceProduct.quantity > 0) {
                serviceProduct.quantity -= 1;
                console.log("decrese quantitiy for" + serviceProduct._id);
                //alert for quantity send to user store email (for manual, for automatic order it will be notify when user have already confirmed payment)
                if (
                  !serviceProduct.isAlerted &&
                  isManual &&
                  serviceProduct.quantity <= serviceProduct.alertQuantity
                ) {
                  if (user) {
                    await sendEmail(
                      "serviceProductQuantityAlert",
                      user.email,
                      `${store.name}, Service Product Quantity Alert`,
                      `We just want to inform that your service product (${serviceProduct.name}) quantity is about to get out of stock.`,
                      `owner of ${store.name}`
                    );
                    serviceProduct.isAlerted = true;
                  }
                }
              }
            }
          }
        }
      }

      await store.save();

      if (isManual) {
        const newOrder = new ORDERS({
          storeId: store._id,
          serviceIds,
          isManual,
          totalPrice,
          totalDuration,
          date: startTime,
          endTime: endTime,
          workerId: workerId ? workerId : longestAvailableWorkerId,
          chosenServiceProductsIds,
          userName,
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

        const newOrder = new ORDERS({
          storeId,
          serviceIds,
          isManual: false,
          totalPrice,
          totalDuration,
          date: startTime,
          endTime: endTime,
          status: "Waiting for Confirmation",
          userId: payload._id,
          hasRating: false,
          workerId: workerId ? workerId : longestAvailableWorkerId,
          chosenServiceProductsIds,
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
          status !== "Completed" &&
          status !== "Rejected"
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
        .sort({ date: 1 }) //asc
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

      query.status = { $in: ["Paid", undefined, "Completed", "Rejected"] };

      const orders = await ORDERS.find(query)
        .sort({ date: 1 }) //asc
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
        for (const serviceId of order.serviceIds) {
          const service = store.services.find(
            (serviceData) =>
              serviceData._id?.toString() === serviceId.toString()
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
      // console.log(today);
      // console.log(today.toISOString()); // For logging in ISO format

      const nextSixDays = new Date();
      nextSixDays.setDate(today.getDate() + 6);
      nextSixDays.setUTCHours(23, 59, 59, 999); // Set to end of next week in UTC
      // console.log(nextSixDays);
      // console.log(nextSixDays.toISOString()); // For logging in ISO format

      let query: any = {
        date: {
          $gte: today,
          $lt: nextSixDays,
        },
      };

      // const payload = <PayloadObj>{
      //   _id: response.data?._id,
      //   role: response.data?.role,
      // };

      const { id: storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res
          .status(400)
          .json(<ResponseObj>{ error: true, message: "Invalid store id" });
      }

      // const store = await STORES.findOne({ userId: payload._id });
      const store = await STORES.findOne({ _id: storeId });
      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      query.storeId = store._id;

      query.status = {
        $in: [
          "Waiting for Confirmation",
          "Waiting for Payment",
          "Paid",
          "Completed",
          undefined,
        ],
      };

      const orders = await ORDERS.find(query)
        .sort({ date: 1 }) //asc
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

export const confirmOrder = async (req: Request, res: Response) => {
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
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { id: orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }

      const order = await ORDERS.findOne({
        _id: orderId,
        status: "Waiting for Confirmation",
      });
      if (!order) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message:
            "Order not found or is not in waiting for confirmation status",
        });
      }

      if (order.storeId.toString() !== store._id.toString()) {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "You are not authorized to confirm this order",
        });
      }

      order.status = "Waiting for Payment";

      await order.save();

      //notify the user via email
      const user = await USERS.findOne({ _id: order.userId });
      // const store = await STORES.findOne({ _id: order.storeId });

      if (user && store) {
        await sendEmail(
          "notifyConfirmOrder",
          user.email,
          `${user.firstName} your order has been confirmed by ${store.name}`,
          `We just want to inform you that your ${order._id} has been confirmed and now is waiting for your payment.`,
          `${user.firstName}`
        );
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Order has been confirmed successfully",
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

export const rejectOrder = async (req: Request, res: Response) => {
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
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { error } = RejectOrderValidate(<RejectOrderRequestObj>req.body);

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const { orderId, rejectedReason }: RejectOrderRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }

      const order = await ORDERS.findOne({
        _id: orderId,
        status: "Waiting for Confirmation",
      });
      if (!order) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message:
            "Order not found or is not in waiting for confirmation status",
        });
      }

      if (order.storeId.toString() !== store._id.toString()) {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "You are not authorized to reject this order",
        });
      }

      order.status = "Rejected";
      order.rejectedReason = rejectedReason;

      await order.save();

      //notify the user via email
      const user = await USERS.findOne({ _id: order.userId });
      //const store = await STORES.findOne({ _id: order.storeId });

      if (user && store) {
        await sendEmail(
          "notifyRejectOrder",
          user.email,
          `${user.firstName} your order has been rejected by ${store.name}`,
          `${rejectedReason}`,
          `${user.firstName}`
        );
      }

      //just for automatic order, increase the service products back
      if (order.isManual === false) {
        const store = await STORES.findOne({ _id: order.storeId });

        if (!store) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: "Store not found",
          });
        }

        for (const serviceId of order.serviceIds) {
          const service = store.services.find(
            (service) => service._id?.toString() === serviceId.toString()
          );
          if (!service) {
            return res.status(404).json(<ResponseObj>{
              error: true,
              message: "Service not found " + serviceId,
            });
          }

          if (service.serviceProduct) {
            const allServiceProductIds = service.serviceProduct;
            console.log("All Service Products Ids: " + allServiceProductIds);

            for (const serviceProductId of allServiceProductIds) {
              const serviceProduct = store.serviceProducts.find(
                (serviceProduct) =>
                  serviceProduct._id?.toString() === serviceProductId.toString()
              );
              if (
                serviceProduct &&
                (serviceProduct.isAnOption === false ||
                  order.chosenServiceProductsIds
                    ?.find(
                      (obj) => obj.serviceId.toString() === serviceId.toString()
                    )
                    ?.serviceProductIds.includes(
                      serviceProduct._id?.toString() ?? ""
                    ))
              ) {
                if (!mongoose.Types.ObjectId.isValid(serviceProductId)) {
                  return res.status(400).json(<ResponseObj>{
                    error: true,
                    message: "Invalid Service Product ID " + serviceProductId,
                  });
                }
                console.log("increase quantity of " + serviceProductId);
                serviceProduct.quantity += 1;
              }
            }
          }
        }

        await store.save();
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Order has been rejected successfully",
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

export const payOrder = async (req: Request, res: Response) => {
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
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "User not found",
        });
      }

      const { id: orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }

      const order = await ORDERS.findOne({
        _id: orderId,
        status: "Waiting for Payment",
      });
      if (!order) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Order not found or is not in waiting for payment status",
        });
      }

      if (order.userId?.toString() !== user._id?.toString()) {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "You are not authorized to pay this order",
        });
      }

      //logic payment

      order.status = "Paid";

      await order.save();

      //notify the user via email
      // const user = await USERS.findOne({ _id: order.userId });
      const store = await STORES.findOne({ _id: order.storeId });

      if (user && store) {
        await sendEmail(
          "notifyPayOrder",
          user.email,
          `${user.firstName} your order for ${store.name} has been paid successfully`,
          `We just want to inform you that your ${order._id} has been paid successfully.`,
          `${user.firstName}`
        );
      }

      //alert service product quantity untuk automatic order
      if (order.isManual === false) {
        const store = await STORES.findOne({ _id: order.storeId });

        if (!store) {
          return res.status(404).json(<ResponseObj>{
            error: true,
            message: "Store not found",
          });
        }

        const user = await USERS.findOne({ _id: store.userId });

        for (const serviceId of order.serviceIds) {
          const service = store.services.find(
            (service) => service._id?.toString() === serviceId.toString()
          );
          if (!service) {
            return res.status(404).json(<ResponseObj>{
              error: true,
              message: "Service not found " + serviceId,
            });
          }

          if (service.serviceProduct) {
            const allServiceProductIds = service.serviceProduct;
            console.log("All Service Products Ids: " + allServiceProductIds);

            for (const serviceProductId of allServiceProductIds) {
              const serviceProduct = store.serviceProducts.find(
                (serviceProduct) =>
                  serviceProduct._id?.toString() === serviceProductId.toString()
              );

              if (
                serviceProduct &&
                (serviceProduct.isAnOption === false ||
                  order.chosenServiceProductsIds
                    ?.find(
                      (obj) => obj.serviceId.toString() === serviceId.toString()
                    )
                    ?.serviceProductIds.includes(
                      serviceProduct._id?.toString() ?? ""
                    ))
              ) {
                if (!mongoose.Types.ObjectId.isValid(serviceProductId)) {
                  return res.status(400).json(<ResponseObj>{
                    error: true,
                    message: "Invalid Service Product ID " + serviceProductId,
                  });
                }

                if (
                  !serviceProduct.isAlerted &&
                  serviceProduct.quantity <= serviceProduct.alertQuantity
                ) {
                  if (user) {
                    await sendEmail(
                      "serviceProductQuantityAlert",
                      user.email,
                      `${store.name}, Service Product Quantity Alert`,
                      `We just want to inform that your service product (${serviceProduct.name}) quantity is about to get out of stock.`,
                      `owner of ${store.name}`
                    );

                    serviceProduct.isAlerted = true;
                  }
                }
              }
            }
          }
        }

        await store.save();
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Order has been paid successfully",
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

export const completeOrder = async (req: Request, res: Response) => {
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
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      const { id: orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Order ID",
        });
      }

      const currentTime = new Date(Date.now() + 7 * 60 * 60 * 1000);

      const order = await ORDERS.findOne({
        _id: orderId,
        status: {
          $in: [undefined, "Paid"],
        },
        date: {
          $lte: currentTime,
        },
      });

      if (!order) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message:
            "Order not found or is neither in Paid Status or a Manual Order or have not started yet",
        });
      }

      if (order.storeId.toString() !== store._id.toString()) {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "You are not authorized to complete this order",
        });
      }

      order.status = "Completed";
      order.endTime = currentTime;

      await order.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Order has been completed successfully",
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
