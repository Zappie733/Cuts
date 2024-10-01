import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useContext, useEffect } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { Theme, Auth } from "../Contexts";
import { logoutUser } from "../Middlewares/AuthMiddleware";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { getUserProfile } from "../Middlewares/UserMiddleware";

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
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <View></View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
