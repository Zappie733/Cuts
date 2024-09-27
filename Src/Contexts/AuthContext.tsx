import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { IAuthObj, IAuthContext } from "../Types/AuthContextTypes";
import {
  storeDataToAsyncStorage,
  getDataFromAsyncStorage,
} from "../Config/AsyncStorage";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const defaultContext: IAuthContext = {
  auth: {
    _id: "",
    refreshToken: "",
    accessToken: "",
  },
  setAuth: () => {},
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

  return <Auth.Provider value={{ auth, setAuth }}>{children}</Auth.Provider>;
};
