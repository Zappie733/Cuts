import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
import { RegisterValidate, LoginValidate } from "../Validation";
import { ResponseObj, UserObj, AuthUser } from "../dto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

export const registerUser = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = RegisterValidate(<UserObj>req.body);
    console.log(error);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ message: error.details[0].message });

    const { firstName, lastName, email, password, phone, role } = <UserObj>(
      req.body
    );

    //Check if email exist
    const isEmailExist = await USERS.findOne({ email: email });
    if (isEmailExist)
      return res.status(409).json(<ResponseObj>{
        message: "User with given email is already exist",
      });

    //Hash Password
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT || "10"));
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create New User
    const user = new USERS({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    //Save User
    await user.save();
    return res
      .status(201)
      .json(<ResponseObj>{ message: "User registered succesfully" });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ message: "Internal Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { error } = LoginValidate(<AuthUser>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ message: error.details[0].message });

    const { email, password } = <AuthUser>req.body;

    const user = await USERS.findOne({ email: email });
    if (!user) {
      return res.status(401).json(<ResponseObj>{ message: "Invalid Email" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(<ResponseObj>{ message: "Invalid Password" });
    }

    const token = user.generateAuthToken();
    return res
      .status(200)
      .json(<ResponseObj>{ data: token, message: "Logged in successfully" });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ message: "Internal Server error" });
  }
};
