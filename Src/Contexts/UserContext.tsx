import { AppState } from "react-native"; // Import AppState
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { IUserContext } from "../Types/ContextTypes/UserContextTypes";
import { getUserProfile, logoutUser } from "../Middlewares/UserMiddleware";
import { Auth } from "./AuthContext";
import { Alert } from "react-native";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { IImageProps } from "../Types/ComponentTypes/ImageTypes";
import { IUserObj } from "../Types/UserTypes";

const defaultContext: IUserContext = {
  user: {
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user",
    verified: true,
    image: {
      imageId: "",
      file: "",
      path: "",
    },
    userId: "",
    likes: [],
    createdAt: new Date(),
  },
  setUser: () => {},
  updateUserImage: (image: IImageProps) => {},
  refetchUser: () => {},
};
export const User = createContext(defaultContext);

export const UserContext = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();

  const defaultUser: IUserObj = {
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user",
    verified: true,
    image: {
      imageId: "",
      file: "",
      path: "",
    },
    userId: "",
    likes: [],
    createdAt: new Date(),
  };
  const [user, setUser] = useState<IUserObj>(defaultUser);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const fetchUserProfile = async () => {
    if (auth._id !== "") {
      const response = await getUserProfile({ auth, updateAccessToken });

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
          setUser(defaultUser);

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
        setUser(response.data);
      } else {
        console.log(response.status, response.message);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchUserProfile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [auth]);

  const updateUserImage = (image: IImageProps) => {
    console.log("Updating user context image:", image);
    setUser((prevUser) => ({
      ...prevUser,
      image,
    }));
  };

  return (
    <User.Provider
      value={{ user, setUser, updateUserImage, refetchUser: fetchUserProfile }}
    >
      {children}
    </User.Provider>
  );
};
