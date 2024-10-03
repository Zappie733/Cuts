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
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { Theme, Auth } from "../Contexts";
import { logoutUser } from "../Middlewares/AuthMiddleware";
import { IResponseProps, UserProfileResponse } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { getUserProfile } from "../Middlewares/UserMiddleware";
import { EvilIcons } from "@expo/vector-icons";

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const handleLogout = async () => {
    console.log("Logout Process");
    const result: IResponseProps = await logoutUser(auth.refreshToken);
    console.log(JSON.stringify(result, null, 2));

    if (result.status >= 200 && result.status < 400) {
      Alert.alert("Success", result.message);
      await removeDataFromAsyncStorage("auth");
      const defaultAuth: IAuthObj = {
        _id: "",
        refreshToken: "",
        accessToken: "",
      };
      setAuth(defaultAuth);
      // Resetting the navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        })
      );
    } else {
      Alert.alert("Logout Error", result.message);
    }
  };

  const defaultUserData: UserProfileResponse = {
    _id: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    verified: true,
    role: "user",
    image: "",
  };

  const [userData, setUserData] =
    useState<UserProfileResponse>(defaultUserData);

  const handleFetchUser = async () => {
    const response = await getUserProfile(auth, updateAccessToken);

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        setUserData(defaultUserData);
        // Resetting the navigation stack
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400 && response.data) {
      setUserData(response.data);
    } else {
      console.error(response.status, response.message);
    }
  };

  useEffect(() => {
    handleFetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleFetchUser();
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      <View style={styles.profileContainer}>
        <View>
          {userData.image !== "" ? (
            <EvilIcons name="user" size={30} color={activeColors.accent} />
          ) : (
            <Image
              source={{ uri: "https://ik.imagekit.io/TheCuts/Cuts/cats.jpg" }}
              style={styles.image}
            />
          )}
        </View>
      </View>

      <Pressable
        onPress={() => {
          changeTheme();
        }}
      >
        <Text style={{ color: activeColors.accent, fontSize: 30 }}>
          Change Theme
        </Text>
      </Pressable>

      <Pressable onPress={handleLogout}>
        <Text style={{ color: activeColors.accent, fontSize: 30 }}>
          Log Out
        </Text>
      </Pressable>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: 150,
    height: 150,
  },
});
