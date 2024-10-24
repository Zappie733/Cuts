import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import React, { useContext } from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { User } from "../../Contexts";

const screenWidth = Dimensions.get("screen").width;

export const AdminHomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { user } = useContext(User);
  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />
      <Text>Welcome Admin {user.firstName}</Text>
    </SafeAreaView>
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
