import { AppState } from "react-native"; // Import AppState
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { logoutUser } from "../Middlewares/UserMiddleware";
import { Auth } from "./AuthContext";
import { Alert } from "react-native";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { IStoreContext } from "../Types/ContextTypes/StoreContextTypes";
import { StoreObj } from "../Types/StoreTypes/StoreTypes";
import { getStoreByUserId } from "../Middlewares/StoreMiddleware/StoreMiddleware";

const defaultContext: IStoreContext = {
  store: {
    _id: "",
    userId: "",
    email: "",
    images: [],
    name: "",
    type: "salon",
    status: "Waiting for Approval",
    district: "",
    subDistrict: "",
    location: "",
    isOpen: false,
    documents: [],
    rejectedReason: "",
    onHoldReason: "",
    approvedBy: "",
    rejectedBy: "",
    holdBy: "",
    unHoldBy: "",
    approvedDate: new Date(0),
    rejectedDate: new Date(0),
    onHoldDate: new Date(0),
    unHoldDate: new Date(0),
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
    canChooseWorker: false,
    workers: [],
    services: [],
    serviceProducts: [],
    salesProducts: [],
    storePromotions: [],
    gallery: [],
    toleranceTime: 0,
  },
  setStore: () => {}, // Placeholder function
  refetchData: () => {},
};

export const Store = createContext(defaultContext);

export const StoreContext = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();

  const defaultStore: StoreObj = {
    _id: "",
    userId: "",
    email: "",
    images: [],
    name: "",
    type: "salon",
    status: "Waiting for Approval",
    district: "",
    subDistrict: "",
    location: "",
    isOpen: false,
    documents: [],
    rejectedReason: "",
    onHoldReason: "",
    approvedBy: "",
    rejectedBy: "",
    holdBy: "",
    unHoldBy: "",
    approvedDate: new Date(0),
    rejectedDate: new Date(0),
    onHoldDate: new Date(0),
    unHoldDate: new Date(0),
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
    canChooseWorker: false,
    workers: [],
    services: [],
    serviceProducts: [],
    salesProducts: [],
    storePromotions: [],
    gallery: [],
    toleranceTime: 0,
  };
  const [store, setStore] = useState<StoreObj>(defaultStore);
  // console.log("store : ", store);

  const { auth, setAuth, updateAccessToken, getRefreshTokenPayload } =
    useContext(Auth);

  const fetchStore = async () => {
    // console.log("set store");
    const refreshTokenPayload = getRefreshTokenPayload();

    if (auth._id !== "" && refreshTokenPayload?.role === "store") {
      const response = await getStoreByUserId({ auth, updateAccessToken });

      if (response.status === 402) {
        Alert.alert("Session Expired", response.message);
        const result: IResponseProps = await logoutUser(auth.refreshToken);
        console.log(JSON.stringify(result, null, 2));

        if (result.status >= 200 && result.status < 400) {
          await removeDataFromAsyncStorage("auth");
          const defaultAuth: IAuthObj = {
            _id: "",
            refreshToken: "",
            accessToken: "",
          };
          setAuth(defaultAuth);
          setStore(defaultStore);

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            })
          );
        } else {
          Alert.alert("Logout Error", result.message);
        }
      }

      if (response.status >= 200 && response.status < 400 && response.data) {
        setStore(response.data);
      } else {
        console.log(response.status, response.message);
      }
    }
  };

  useEffect(() => {
    fetchStore();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchStore();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [auth]);

  return (
    <Store.Provider value={{ store, setStore, refetchData: fetchStore }}>
      {children}
    </Store.Provider>
  );
};
