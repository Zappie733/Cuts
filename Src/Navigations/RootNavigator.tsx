import { StyleSheet } from "react-native";
import React, { useContext } from "react";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import { TabsNavigator, TabsStackParamsObj } from "./TabNavigator";
import { LoginScreen } from "../Screens/LoginScreen";
import { WelcomeScreen } from "../Screens/WelcomeScreen";
import { RegisterScreen } from "../Screens/RegisterScreen";
import { Auth, User, UserContext } from "../Contexts";
import { ProfileScreen } from "../Screens/ProfileScreen";
import { RegisterStoreScreen } from "../Screens/RegisterStoreScreen";
import { DocumentDetailsScreen } from "../Screens/DocumentDetailsScreen";
import { IRegistrationStoreProps } from "../Types/RegisterStoreScreenTypes";

export type RootStackParamsObj = {
  TabsStack: NavigatorScreenParams<TabsStackParamsObj>;
  Welcome: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  Profile: undefined;
  RegisterStoreScreen:
    | {
        data: IRegistrationStoreProps | undefined;
        reason: string | undefined;
      }
    | undefined;
  DocumentDetailsScreen: {
    documentUri: string;
    fileName: string;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamsObj>();

export type RootStackScreenProps<T extends keyof RootStackParamsObj> =
  NativeStackScreenProps<RootStackParamsObj, T>;

export const RootNavigator = () => {
  const { auth } = useContext(Auth);
  const { user } = useContext(User);

  return (
    <RootStack.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
      initialRouteName="Welcome"
    >
      {auth._id === "" ? (
        <>
          {console.log("root nav guest")}
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="LoginScreen" component={LoginScreen} />
          <RootStack.Screen name="RegisterScreen" component={RegisterScreen} />
          <RootStack.Screen name="TabsStack" component={TabsNavigator} />
        </>
      ) : auth._id !== "" && user.role === "user" ? (
        <>
          {console.log("root nav user")}
          <RootStack.Screen name="TabsStack" component={TabsNavigator} />
          <RootStack.Screen name="Profile" component={ProfileScreen} />
          <RootStack.Screen
            name="RegisterStoreScreen"
            component={RegisterStoreScreen}
          />
          <RootStack.Screen
            name="DocumentDetailsScreen"
            component={DocumentDetailsScreen}
          />
        </>
      ) : auth._id !== "" && user.role === "store" ? (
        <>
          {console.log("root nav store")}
          <RootStack.Screen name="TabsStack" component={TabsNavigator} />
        </>
      ) : (
        <>
          {console.log("root nav admin")}
          <RootStack.Screen name="TabsStack" component={TabsNavigator} />
          <RootStack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({});
