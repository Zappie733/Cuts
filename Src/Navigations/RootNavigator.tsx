import { StyleSheet } from "react-native";
import React from "react";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import { TabsNavigator, TabsStackParamsObj } from "./TabNavigator";
import { LoginScreen } from "../Screens/LoginScreen";
import { WelcomeScreen } from "../Screens/WelcomeScreen";
import { RegisterScreen } from "../Screens/RegisterScreen";

export type RootStackParamsObj = {
  TabsStack: NavigatorScreenParams<TabsStackParamsObj>;
  Welcome: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamsObj>();

export type RootStackScreenProps<T extends keyof RootStackParamsObj> =
  NativeStackScreenProps<RootStackParamsObj, T>;

export const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <RootStack.Screen name="Welcome" component={WelcomeScreen} />
      <RootStack.Screen name="LoginScreen" component={LoginScreen} />
      <RootStack.Screen name="RegisterScreen" component={RegisterScreen} />
      <RootStack.Screen name="TabsStack" component={TabsNavigator} />
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({});
