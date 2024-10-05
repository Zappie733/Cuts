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
import { Auth, UserContext } from "../Contexts";
import { ProfileScreen } from "../Screens/ProfileScreen";

export type RootStackParamsObj = {
  TabsStack: NavigatorScreenParams<TabsStackParamsObj>;
  Welcome: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamsObj>();

export type RootStackScreenProps<T extends keyof RootStackParamsObj> =
  NativeStackScreenProps<RootStackParamsObj, T>;

export const RootNavigator = () => {
  const { auth } = useContext(Auth);

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
      ) : (
        <>
          {console.log("root nav user/admin/store")}
          <RootStack.Screen name="TabsStack" component={TabsNavigator} />
          <RootStack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({});
