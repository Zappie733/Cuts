import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { logoutUser } from "../Middlewares/UserMiddleware";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
export const apiCallHandler = async ({
  apiCall,
  auth,
  setAuth,
  navigation,
}: {
  apiCall: () => Promise<any>;
  auth: IAuthObj;
  setAuth: (auth: IAuthObj) => void;
  navigation: any;
}) => {
  try {
    const response = await apiCall();

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);

      const result = await logoutUser(auth.refreshToken);

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
      return null; // Exit early after handling 402
    }

    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
