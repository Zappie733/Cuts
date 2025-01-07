
import {
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  Dimensions,
  AppState,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  AntDesign,
  EvilIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { Switch } from "../Components/Switch";
import { Store } from "../Components/Store";
import { logoutUser } from "../Middlewares/UserMiddleware";
import { GetStoresByUserIdResponse } from "../Types/ResponseTypes/StoreResponse";
import { getStoresByUserId } from "../Middlewares/StoreMiddleware/StoreMiddleware";
import { Store as StoresC } from "../Contexts/StoreContext";
import { ImageSlider } from "../Components/ImageSlider";
import { PressableOptions } from "../Components/PressableOptions";
import { GetRatingSummaryByStoreIdResponse } from "../Types/ResponseTypes/RatingResponse";
import { getRatingSummaryByStoreId } from "../Middlewares/RatingMiddleware";
import { PerRating } from "../Components/PerRating";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { apiCallHandler } from "../Middlewares/util";
import { Theme } from "../Contexts/ThemeContext";
import { Auth } from "../Contexts/AuthContext";
import { User } from "../Contexts/UserContext";

import { HairCustomization } from "../Components/CustomHair";

export const ToolsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Tools">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const screenWidth = Dimensions.get("screen").width;

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 90, flex: 1 }}
      >
        <HairCustomization></HairCustomization>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
