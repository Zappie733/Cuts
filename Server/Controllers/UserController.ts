import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
import {
  RegisterValidate,
  LoginValidate,
  RefreshTokenValidate,
} from "../Validation";
import { UserObj, AuthUser, RefreshTokenObj, PayloadObj } from "../dto";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { generateTokens, verifyRefreshToken } from "../Utils/UserTokenUtil";
import { ACCESS_TOKEN_PRIVATE_KEY } from "../Config";
import jwt from "jsonwebtoken";
import { LoginDataResponse, ResponseObj } from "../Response";
import { USERTOKEN } from "../Models/UserTokenModel";
config({ path: ".env.development" });

export const registerUser = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = RegisterValidate(<UserObj>req.body);
    //console.log(error);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { firstName, lastName, email, password, phone, role } = <UserObj>(
      req.body
    );

    //Check if email exist
    const isEmailExist = await USERS.findOne({ email: email });
    if (isEmailExist)
      return res.status(409).json(<ResponseObj>{
        error: true,
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
    return res.status(201).json(<ResponseObj>{
      error: false,
      message: "User registered succesfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = LoginValidate(<AuthUser>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { email, password } = <AuthUser>req.body;

    //Check if user exist
    const user = await USERS.findOne({ email: email });

    if (!user) {
      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "Invalid Email Or Password",
      });
    }

    //Validate Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "Invalid Password Or Password",
      });
    }

    //Generate Access Token And Refresh Token
    //const token = user.generateAuthToken();
    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(200).json(<ResponseObj<LoginDataResponse>>{
      error: false,
      data: { _id: user._id, accessToken, refreshToken },
      message: "Logged in successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const getAccessTokenByRefreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { error } = RefreshTokenValidate(<RefreshTokenObj>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { refreshToken } = <RefreshTokenObj>req.body;

    // Verify the refresh token
    const response: ResponseObj<PayloadObj> = await verifyRefreshToken(<
      RefreshTokenObj
    >{
      refreshToken,
    });
    //console.log(response);
    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        roles: response.data?.roles,
      };

      const accessToken = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "30m",
      });

      return res.status(200).json(<ResponseObj>{
        error: false,
        data: { accessToken },
        message: "Access token created successfully",
      });
    }

    return res
      .status(400)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    return res.status(500).json(<ResponseObj>{
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { error } = RefreshTokenValidate(<RefreshTokenObj>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { refreshToken } = <RefreshTokenObj>req.body;
    const userToken = await USERTOKEN.findOne({ refreshToken });
    if (!userToken)
      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Logged Out Successfully",
      });

    await USERTOKEN.deleteOne({ _id: userToken._id });

    return res.status(200).json(<ResponseObj>{
      error: false,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};
