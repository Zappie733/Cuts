import { Settings, StyleSheet, Text } from "react-native";
import React, { Children, useContext } from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { RootStackScreenProps } from "./RootNavigator";
import { Ionicons, Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";

import { HomeScreen } from "../Screens/HomeScreen";
import { colors } from "../Config/Theme";
import { ToolsScreen } from "../Screens/ToolsScreen";
import { SettingsScreen } from "../Screens/SettingsScreen";
import { AdminHomeScreen } from "../Screens/Admin/AdminHomeScreen";
import { AdminStoreManagementScreen } from "../Screens/Admin/AdminStoreManagementScreen";
import { StoreHomeScreen } from "../Screens/Store/StoreHomeScreen";
import { StoreScheduleScreen } from "../Screens/Store/StoreScheduleScreen";
import { Theme } from "../Contexts/ThemeContext";
import { Auth } from "../Contexts/AuthContext";
import { OrderScreen } from "../Screens/OrderScreen";

export type TabsStackParamsObj = {
  Home: undefined;
  Settings: undefined;
  Tools: undefined;

  AdminStoreManagement: undefined;

  StoreSchedule: undefined;

  Order: undefined;
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
            | keyof typeof Fontisto.glyphMap
            | keyof typeof MaterialCommunityIcons.glyphMap;
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
          } else if (route.name === "Tools") {
            iconName = focused ? "hammer" : "hammer-outline";
            return (
              <Ionicons name={iconName} size={iconSize} color={iconColor} />
            );
          }

          // Use Fontisto for StoreManagement
          else if (route.name === "AdminStoreManagement") {
            iconName = "shopping-store"; // Fontisto doesn't have focused/unfocused variants
            //iconName = focused ? "storefront" : "storefront-outline";
            return (
              <Fontisto name={iconName} size={iconSize} color={iconColor} />
            );
          } else if (route.name === "StoreSchedule" || route.name === "Order") {
            iconName = focused ? "clipboard-list" : "clipboard-list-outline";
            return (
              <MaterialCommunityIcons
                name={iconName}
                size={iconSize}
                color={iconColor}
              />
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
          {/* {console.log("bottom tab guest")} */}
          <TabsStack.Screen
            name="Home"
            component={HomeScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="Order"
            component={OrderScreen}
            options={{ unmountOnBlur: true }}
          />
        </>
      )}
      {role === "user" && (
        <>
          {/* {console.log("bottom tab user")} */}
          <TabsStack.Screen
            name="Home"
            component={HomeScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="Order"
            component={OrderScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="Tools"
            component={ToolsScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ unmountOnBlur: true }}
          />
        </>
      )}
      {role === "admin" && (
        <>
          {/* {console.log("bottom tab admin")} */}
          <TabsStack.Screen
            name="Home"
            component={AdminHomeScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="AdminStoreManagement"
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
              unmountOnBlur: true,
            }}
          />
          <TabsStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ unmountOnBlur: true }}
          />
        </>
      )}
      {role === "store" && (
        <>
          {/* {console.log("bottom tab store")} */}
          <TabsStack.Screen
            name="Home"
            component={StoreHomeScreen}
            options={{ unmountOnBlur: true }}
          />
          <TabsStack.Screen
            name="StoreSchedule"
            component={StoreScheduleScreen}
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
                  Schedule
                </Text>
              ),
              unmountOnBlur: true,
            }}
          />
          <TabsStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ unmountOnBlur: true }}
          />
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
