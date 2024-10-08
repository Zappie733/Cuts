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
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { Theme, Auth, User } from "../Contexts";
import { logoutUser } from "../Middlewares/AuthMiddleware";
import { IResponseProps, UserProfileResponse } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  EvilIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Header } from "../Components/Header";
import { Switch } from "../Components/Switch";

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { auth, setAuth } = useContext(Auth);
  let { user } = useContext(User);

  const screenWidth = Dimensions.get("screen").width;

  const handleGoBack = () => {
    navigation.goBack();
  };

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

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.profileContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            {user.image === "" ? (
              <View
                style={[
                  styles.noImage,
                  {
                    backgroundColor: activeColors.primary,
                  },
                ]}
              >
                <EvilIcons name="user" size={100} color={activeColors.accent} />
              </View>
            ) : (
              <Image source={{ uri: user.image }} style={styles.image} />
            )}
          </View>
          {/* Profile Info */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.profileText,
                { color: activeColors.accent, fontSize: 22, fontWeight: "400" },
              ]}
            >
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.profileText, { color: activeColors.accent }]}>
              {user.email}
            </Text>
            <Text style={[styles.profileText, { color: activeColors.accent }]}>
              {user.phone}
            </Text>
          </View>

          {/* Edit Button */}
          <Pressable
            style={{ position: "absolute", top: 10, right: 10 }}
            onPress={() => navigation.navigate("Profile")}
          >
            <FontAwesome5
              name="user-edit"
              color={activeColors.accent}
              size={20}
            />
          </Pressable>
        </View>
        {/* Theme */}
        <View
          style={[
            styles.themeContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          <View style={styles.themeTextContainer}>
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={activeColors.accent}
            />

            <Text style={[styles.themeText, { color: activeColors.accent }]}>
              Theme ({theme.mode === "dark" ? "Dark" : "Light"} mode)
            </Text>
          </View>

          <Switch onPress={changeTheme} />
        </View>
        {/* Logout */}
        <Pressable onPress={handleLogout}>
          <View
            style={[
              styles.logoutContainer,
              { backgroundColor: activeColors.tertiary },
            ]}
          >
            <Text style={[styles.logoutText, { color: activeColors.accent }]}>
              Log Out
            </Text>

            <MaterialIcons
              name="logout"
              size={24}
              color={activeColors.accent}
            />
          </View>
        </Pressable>
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
  profileContainer: {
    flexDirection: "row",
    borderRadius: 10,
    marginHorizontal: 30,
    marginTop: 20,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  noImage: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  imageContainer: {
    padding: 10,
  },
  infoContainer: {
    flexDirection: "column",
    marginTop: 5,
  },
  profileText: {
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 5,
  },
  themeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 30,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  themeTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeText: {
    fontSize: 20,
    fontWeight: "400",
    marginRight: 20,
    marginLeft: 5,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
    borderRadius: 10,
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 20,
    marginRight: 10,
  },
});
