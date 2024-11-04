import { Request, Response } from "express";
import { GetWorkersByStoreIdResponse, ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";
import { RegisterWorkerValidate } from "../Validation/StoreValidation/WorkerValidation/RegisterWorkerValidate";
import {
  AbsenceWorkerRequestObj,
  RegisterWorkerRequestObj,
  UpdateWorkerRequestObj,
  WorkerObj,
} from "../dto/Worker";
import mongoose from "mongoose";
import { UpdateWorkerValidate } from "../Validation/StoreValidation/WorkerValidation/UpdateWorkerValidate";
import { AbsenceWorkerValidate } from "../Validation/StoreValidation/WorkerValidation/AbsenceWorkerValidate";

export const getWorkersByStoreId = async (req: Request, res: Response) => {
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
      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
      const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

      const { id: storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res
          .status(400)
          .json(<ResponseObj>{ error: true, message: "Invalid store id" });
      }

      const responseData: GetWorkersByStoreIdResponse = {
        workers: [],
        total: 0,
      };

      const store = await STORES.findOne({ _id: storeId });
      // console.log(store);
      if (store) {
        const totalWorkers = store.workers.length;

        if (totalWorkers === 0) {
          return res.status(200).json(<
            ResponseObj<GetWorkersByStoreIdResponse>
          >{
            error: false,
            message: `${store.name}does not have any workers`,
            data: responseData,
          });
        }

        const paginatedWorkers = store.workers.slice(offset, offset + limit);

        responseData.workers = paginatedWorkers;
        responseData.total = totalWorkers;

        return res.status(200).json(<ResponseObj<GetWorkersByStoreIdResponse>>{
          error: false,
          message: `Workers of ${store.name} retrieved successfully`,
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

export const registerWorker = async (req: Request, res: Response) => {
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
      const { error } = RegisterWorkerValidate(
        <RegisterWorkerRequestObj>req.body
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

      const { firstName, lastName, age, email, role } = <
        RegisterWorkerRequestObj
      >req.body;

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      const newWorker: WorkerObj = {
        firstName,
        lastName,
        age,
        email: email?.toLowerCase(),
        role,
      };

      store.workers.push(newWorker);

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${newWorker.firstName} has been added as ${
          newWorker.role === "admin" ? "an admin" : "a worker"
        } successfully`,
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

export const deleteWorker = async (req: Request, res: Response) => {
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

      const { id: workerIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(workerIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Worker ID",
        });
      }

      const worker = store.workers.find((worker) => {
        if (worker._id) {
          return worker._id.toString() === workerIdParam.toString();
        }
      });

      if (!worker) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Worker not found" });
      }

      store.workers = store.workers.filter((workerData) => {
        if (worker._id && workerData._id)
          return workerData._id.toString() !== worker._id.toString();
      });

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${worker.firstName} has been deleted successfully`,
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

export const updateWorker = async (req: Request, res: Response) => {
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

      const { error } = UpdateWorkerValidate(<UpdateWorkerRequestObj>req.body);

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const {
        workerId,
        firstName,
        lastName,
        age,
        email,
        role,
      }: UpdateWorkerRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(workerId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Worker ID",
        });
      }

      const worker = store.workers.find((worker) => {
        if (worker._id) {
          return worker._id.toString() === workerId.toString();
        }
      });

      if (!worker) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Worker not found" });
      }

      worker.firstName = firstName;
      worker.lastName = lastName;
      worker.age = age;
      worker.email = email.toLowerCase();
      worker.role = role;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `worker has been updated successfully`,
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

export const clockIn = async (req: Request, res: Response) => {
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

      const { id: workerIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(workerIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Worker ID",
        });
      }

      const worker = store.workers.find((worker) => {
        if (worker._id) {
          return worker._id.toString() === workerIdParam.toString();
        }
      });

      if (!worker) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Worker not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight

      const adjustedToday = new Date(today.getTime() + 7 * 60 * 60 * 1000);

      const workerHistory = worker.history?.find(
        (history) =>
          history.date.toDateString() === adjustedToday.toDateString()
      );
      // console.log(workerHistory?.date.toDateString());
      // console.log(workerHistory?.date);
      // console.log(adjustedToday.toDateString());
      // console.log(adjustedToday);
      // console.log(today.toDateString());
      // console.log(today);
      if (workerHistory && !workerHistory.isAbsence) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: `${worker.firstName}, you have already clocked in today`,
        });
      }

      worker.isOnDuty = true;

      //jika ada history tapi berupa absence
      if (workerHistory && workerHistory.isAbsence) {
        workerHistory.isAbsence = false;
        workerHistory.reason = undefined;
        workerHistory.clockIn = new Date(Date.now() + 7 * 60 * 60 * 1000);

        await store.save();
        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `${worker.firstName} clocked in successfully`,
        });
      }

      //jika tidak ada history
      worker.history?.push({
        date: adjustedToday,
        clockIn: new Date(Date.now() + 7 * 60 * 60 * 1000),
        isAbsence: false,
      });

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${worker.firstName} clocked in successfully`,
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

export const clockOut = async (req: Request, res: Response) => {
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

      const { id: workerIdParam } = req.params;
      if (!mongoose.Types.ObjectId.isValid(workerIdParam)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Worker ID",
        });
      }

      const worker = store.workers.find((worker) => {
        if (worker._id) {
          return worker._id.toString() === workerIdParam.toString();
        }
      });

      if (!worker) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Worker not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight

      const adjustedToday = new Date(today.getTime() + 7 * 60 * 60 * 1000);

      const workerHistory = worker.history?.find(
        (history) =>
          history.date.toDateString() === adjustedToday.toDateString()
      );

      if (!workerHistory || (workerHistory && workerHistory.isAbsence)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: `${worker.firstName}, You haven't clocked in today`,
        });
      }

      workerHistory.clockOut = new Date(Date.now() + 7 * 60 * 60 * 1000);

      worker.isOnDuty = false;

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${worker.firstName} clocked out successfully`,
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

export const absence = async (req: Request, res: Response) => {
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

      const { error } = AbsenceWorkerValidate(
        <AbsenceWorkerRequestObj>req.body
      );

      if (error) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });
      }

      const { id, reason }: AbsenceWorkerRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Worker ID",
        });
      }

      const worker = store.workers.find((worker) => {
        if (worker._id) {
          return worker._id.toString() === id.toString();
        }
      });

      if (!worker) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Worker not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight

      const adjustedToday = new Date(today.getTime() + 7 * 60 * 60 * 1000);

      const workerHistory = worker.history?.find(
        (history) =>
          history.date.toDateString() === adjustedToday.toDateString()
      );

      worker.isOnDuty = false;

      if (workerHistory) {
        workerHistory.clockIn = undefined;
        workerHistory.clockOut = undefined;
        workerHistory.isAbsence = true;
        workerHistory.reason = reason;

        await store.save();

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `${worker.firstName} absence recorded successfully`,
        });
      }

      // belum ada history
      worker.history?.push({
        date: adjustedToday,
        isAbsence: true,
        reason: reason,
      });

      await store.save();

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `${worker.firstName} absence recorded successfully`,
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
