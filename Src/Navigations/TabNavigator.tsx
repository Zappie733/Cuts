import { Settings, StyleSheet, Text } from "react-native";
import React, { Children, useContext } from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { RootStackScreenProps } from "./RootNavigator";
import { Ionicons, Fontisto } from "@expo/vector-icons";

import { HomeScreen } from "../Screens/HomeScreen";
import { colors } from "../Config/Theme";
import { SettingsScreen } from "../Screens/SettingsScreen";
import { Theme, Auth } from "../Contexts/";
import { AdminHomeScreen } from "../Screens/Admin/AdminHomeScreen";
import { AdminStoreManagementScreen } from "../Screens/Admin/AdminStoreManagementScreen";
import { StoreHomeScreen } from "../Screens/Store/StoreHomeScreen";

export type TabsStackParamsObj = {
  Home: undefined;
  Settings: undefined;

  StoreManagement: undefined;
};

const TabsStack = createBottomTabNavigator<TabsStackParamsObj>();

export type TabsStackScreenProps<T extends keyof TabsStackParamsObj> =
  CompositeScreenProps<
    BottomTabScreenProps<TabsStackParamsObj, T>,
    RootStackScreenProps<"TabsStack">
  >;

export const TabsNavigator = () => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { getRefreshTokenPayload } = useContext(Auth);
  const payload = getRefreshTokenPayload();

  const role = payload?.role;

  return (
    <TabsStack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName:
            | keyof typeof Ionicons.glyphMap
            | keyof typeof Fontisto.glyphMap;
          const iconSize = 24;
          let iconColor = focused ? activeColors.accent : activeColors.tertiary;

          // Use Ionicons for Home and Settings
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
            return (
              <Ionicons name={iconName} size={iconSize} color={iconColor} />
            );
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
            return (
              <Ionicons name={iconName} size={iconSize} color={iconColor} />
            );
          }

          // Use Fontisto for StoreManagement
          else if (route.name === "StoreManagement") {
            iconName = "shopping-store"; // Fontisto doesn't have focused/unfocused variants
            //iconName = focused ? "storefront" : "storefront-outline";
            return (
              <Fontisto name={iconName} size={iconSize} color={iconColor} />
            );
          }

          // Default fallback icon
          return <Ionicons name="help" size={iconSize} color={iconColor} />;
        },
        tabBarLabel: ({ children, focused }) => (
          <Text
            style={{
              fontSize: 10,
              color: focused ? activeColors.accent : activeColors.tertiary,
              fontWeight: focused ? "bold" : "normal",
            }}
          >
            {children}
          </Text>
        ),
        tabBarStyle: [
          styles.tabBarStyle,
          {
            backgroundColor: activeColors.secondary,
            shadowColor: activeColors.tertiary,
          },
        ],
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarActiveBackgroundColor: activeColors.primary,
      })}
    >
      {role === undefined && (
        <>
          {console.log("bottom tab guest")}
          <TabsStack.Screen name="Home" component={HomeScreen} />
        </>
      )}
      {role === "user" && (
        <>
          {console.log("bottom tab user")}
          <TabsStack.Screen name="Home" component={HomeScreen} />
          <TabsStack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
      {role === "admin" && (
        <>
          {console.log("bottom tab admin")}
          <TabsStack.Screen name="Home" component={AdminHomeScreen} />
          <TabsStack.Screen
            name="StoreManagement"
            component={AdminStoreManagementScreen}
            options={{
              tabBarLabel: ({ focused }) => (
                <Text
                  style={{
                    fontSize: 10,
                    color: focused
                      ? activeColors.accent
                      : activeColors.tertiary,
                    fontWeight: focused ? "bold" : "normal",
                  }}
                >
                  Store Management
                </Text>
              ),
            }}
          />
          <TabsStack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
      {role === "store" && (
        <>
          {console.log("bottom tab store")}
          <TabsStack.Screen name="Home" component={StoreHomeScreen} />
          <TabsStack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </TabsStack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    position: "absolute",
    bottom: 10,
    right: 20,
    left: 20,
    borderTopWidth: 0,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  tabBarItemStyle: {
    paddingVertical: 10,
    borderRadius: 40,
    margin: 5,
  },
});
