import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Auth } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";
import { IOrderContext } from "../Types/ContextTypes/OrderContextTypes";
import { AddOrderData } from "../Types/OrderTypes";
import {
  getDataFromAsyncStorage,
  storeDataToAsyncStorage,
} from "../Config/AsyncStorage";
import * as SplashScreen from "expo-splash-screen";

const defaultContext: IOrderContext = {
  orders: [],
  setOrders: () => {},
};

export const Orders = createContext(defaultContext);

export const OrderContext = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();

  const [orders, setOrders] = useState<AddOrderData[]>();
  // console.log("orders : ", orders);

  const isFirstRender = useRef(true);
  // console.log("isFirstRender:" + isFirstRender.current);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    storeDataToAsyncStorage("orders", orders);
  }, [orders]);

  const loadOrdersFromStorage = async () => {
    try {
      const orders = await getDataFromAsyncStorage("orders");

      if (orders !== null) {
        setOrders(orders);
      } else {
        setOrders(defaultContext.orders);
        storeDataToAsyncStorage("orders", orders);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      await setTimeout(() => {
        console.log("close SplashScreen");
        SplashScreen.hideAsync();
      }, 1000);
    }
  };

  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  return (
    <Orders.Provider
      value={{
        orders: orders ?? [],
        setOrders,
      }}
    >
      {children}
    </Orders.Provider>
  );
};
