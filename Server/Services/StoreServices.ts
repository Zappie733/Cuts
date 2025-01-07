import { Request, Response } from 'express';
import { RegisterStoreRequestObj, PendingStoreObj } from "../dto";
import bcrypt from "bcrypt";
import { SALT } from "../Config";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import { PipelineStage } from 'mongoose';

export async function validateUniqueConstraints(email: string, storeName: string) {
    const isEmailExist = await USERS.findOne({ email: email.toLowerCase() });
    if (isEmailExist) {
        throw new Error("User with given email already exists");
    }
  
    const isStoreNameExist = await STORES.findOne({ name: storeName });
    if (isStoreNameExist) {
        throw new Error("Store with given name already exists");
    }
}

export async function createUserWithStore(storeData: RegisterStoreRequestObj) {
    const pendingStoreData: PendingStoreObj = {
        storeImages: storeData.storeImages,
        storeName: storeData.storeName,
        storeLocation: storeData.storeLocation,
        storeType: storeData.storeType,
        storeDocuments: storeData.storeDocuments,
        storeDistrict: storeData.storeDistrict,
        storeSubDistrict: storeData.storeSubDistrict
    };
    
    const salt = await bcrypt.genSalt(parseInt(SALT || "10"));
    const hashedPassword = await bcrypt.hash(storeData.password, salt);
    const user = new USERS({
        email: storeData.email.toLowerCase(),
        password: hashedPassword,
        role: storeData.role,
        userId: storeData.userId,
        pendingStoreData,
    });
    await user.save();

    console.log("user")
    console.log(user)

    return user;
}

export async function getClosestStore(req: Request, res: Response){
    const userLat = parseFloat(req.query.lat as string);
    const userLon = parseFloat(req.query.lon as string);
  
    if (!userLat ||!userLon) {
      return res.status(400).send({ message: 'Latitude and longitude are required' });
    }

    const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [userLon, userLat] // longitude first, then latitude
            },
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.001, // Convert meters to kilometers
            key: "location.coordinates", // Specify the field containing coordinates
            query: {} // Add any additional query conditions here
          }
        },
        {
          $limit: 5
        }
    ]
  
    try {
        const closestStores = await STORES.aggregate(pipeline);
      return res.send(closestStores);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error getting closest stores' });
    }
};
  