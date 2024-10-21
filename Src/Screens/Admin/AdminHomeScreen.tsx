import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
} from "react-native";
import React, { useContext } from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

export const AdminHomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />
      <Text>Admin Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
  },
});
