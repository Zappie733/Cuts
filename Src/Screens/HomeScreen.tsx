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
import { colors } from "../Config/Theme";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { Theme } from "../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Header } from "../Components/Header";
import { Auth } from "../Contexts";

const screenWidth = Dimensions.get("screen").width;

export const HomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { auth } = useContext(Auth);
  const handleGoBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      {auth._id === "" && <Header goBack={handleGoBack} />}
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />

      <Text>Home Screen</Text>
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
