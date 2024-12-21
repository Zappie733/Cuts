import { RegisterStoreRequestObj, PendingStoreObj } from "../dto";
import bcrypt from "bcrypt";
import { SALT } from "../Config";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";

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