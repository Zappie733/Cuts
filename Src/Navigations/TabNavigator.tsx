import { Settings, StyleSheet, Text } from "react-native";
import React, { Children } from "react";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { RootStackScreenProps } from "./RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../Screens/HomeScreen";
import { colors } from "../Config/Theme";
import { SettingsScreen } from "../Screens/SettingsScreen";

export type TabsStackParamsObj = {
  Home: undefined;
  Settings: undefined;
};

const TabsStack = createBottomTabNavigator<TabsStackParamsObj>();

export type TabsStackScreenProps<T extends keyof TabsStackParamsObj> =
  CompositeScreenProps<
    BottomTabScreenProps<TabsStackParamsObj, T>,
    RootStackScreenProps<"TabsStack">
  >;

export const TabsNavigator = () => {
  let activeColors = colors.dark;

  return (
    <TabsStack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          const iconSize = 24;
          let iconColor;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              iconColor = focused ? activeColors.accent : activeColors.tertiary;
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              iconColor = focused ? activeColors.accent : activeColors.tertiary;
              break;
            default:
              iconName = "help";
          }

          return <Ionicons name={iconName} size={iconSize} color={iconColor} />;
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
      <TabsStack.Screen name="Home" component={HomeScreen} />
      <TabsStack.Screen name="Settings" component={SettingsScreen} />
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
