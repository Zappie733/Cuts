import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import {
  IAuthObj,
  IAuthContext,
  refreshTokenPayloadObj,
} from "../Types/AuthContextTypes";
import {
  storeDataToAsyncStorage,
  getDataFromAsyncStorage,
} from "../Config/AsyncStorage";
import * as SplashScreen from "expo-splash-screen";
import { jwtDecode } from "jwt-decode";

SplashScreen.preventAutoHideAsync();

const defaultContext: IAuthContext = {
  auth: {
    _id: "",
    refreshToken: "",
    accessToken: "",
  },
  setAuth: () => {},
  getRefreshTokenPayload: () => null,
  updateAccessToken: () => {},
};
export const Auth = createContext(defaultContext);

export const AuthContext = ({ children }: { children: ReactNode }) => {
  const defaultAuth: IAuthObj = {
    _id: "",
    refreshToken: "",
    accessToken: "",
  };
  const [auth, setAuth] = useState<IAuthObj>(defaultAuth);

  const isFirstRender = useRef(true);
  console.log("isFirstRender:" + isFirstRender.current);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (auth !== null) {
      console.log(auth);
      storeDataToAsyncStorage("auth", auth);
    }
  }, [auth]);

  const loadAuthFromStorage = async () => {
    try {
      const auth = await getDataFromAsyncStorage("auth");

      if (auth !== null) {
        setAuth(auth);
      } else {
        setAuth(defaultAuth);
        storeDataToAsyncStorage("auth", auth);
      }
    } catch (e) {
      console.error("Failed to load auth:", e);
    } finally {
      await setTimeout(() => {
        console.log("close SplashScreen");
        SplashScreen.hideAsync();
      }, 1000);
    }
  };

  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  const getRefreshTokenPayload = () => {
    if (!auth.refreshToken) {
      //console.log("No refresh token available");
      return null;
    }

    try {
      const decodedPayload: refreshTokenPayloadObj = jwtDecode(
        auth.refreshToken
      ); // Decode the token
      return decodedPayload;
    } catch (error) {
      console.error("Error decoding refresh token:", error);
      return null;
    }
  };

  const updateAccessToken = (newAccessToken: string) => {
    setAuth((prevAuth) => ({
      ...prevAuth,
      accessToken: newAccessToken,
    }));
  };

  return (
    <Auth.Provider
      value={{ auth, setAuth, getRefreshTokenPayload, updateAccessToken }}
    >
      {children}
    </Auth.Provider>
  );
};
