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
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { Theme, Auth, User } from "../Contexts";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  EvilIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Switch } from "../Components/Switch";
import { Store } from "../Components/Store";
import { logoutUser } from "../Middlewares/UserMiddleware";
import { GetStoresByUserIdResponse } from "../Types/ResponseTypes/StoreResponse";
import { getStoresByUserId } from "../Middlewares/StoreMiddleware/StoreMiddleware";
import { Store as StoresC } from "../Contexts/StoreContext";
import { ImageSlider } from "../Components/ImageSlider";

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  let { user } = useContext(User);
  const { store, refetchData } = useContext(StoresC);

  const screenWidth = Dimensions.get("screen").width;

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

  const handleAddStore = () => {
    navigation.navigate("RegisterStoreScreen");
  };

  const [getUserStores, setGetUserStores] =
    useState<GetStoresByUserIdResponse>();
  //console.log(JSON.stringify(getUserStores, null, 2));

  const handleFetchUserStores = async () => {
    if (auth._id !== "") {
      const response = await getStoresByUserId({ auth, updateAccessToken });

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
        setGetUserStores(response.data);
      } else {
        console.log(response.status, response.message);
      }
    }
  };

  const operationalHourModification = (value: number) => {
    if (value === 0) {
      return "00";
    }

    if (value < 10) {
      return `0${value}`;
    }

    return value;
  };

  //getUserStores
  useEffect(() => {
    handleFetchUserStores();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleFetchUserStores();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      handleFetchUserStores();
    }, [])
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 90 }}
      >
        {/* Profile Container */}
        <View
          style={[
            styles.profileContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          {user.role === "user" && (
            <>
              {/* Image */}
              <View style={styles.imageContainer}>
                {!user.image || user.image.file === "" ? (
                  <View
                    style={[
                      styles.noImage,
                      {
                        backgroundColor: activeColors.primary,
                      },
                    ]}
                  >
                    <EvilIcons
                      name="user"
                      size={100}
                      color={activeColors.accent}
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: user.image.file }}
                    style={styles.image}
                  />
                )}
              </View>

              {/* Profile Info */}
              <View style={styles.infoContainer}>
                <Text
                  style={[
                    styles.profileText,
                    {
                      color: activeColors.accent,
                      fontSize: 22,
                      fontWeight: "400",
                    },
                  ]}
                >
                  {user.firstName} {user.lastName}
                </Text>
                <Text
                  style={[styles.profileText, { color: activeColors.accent }]}
                >
                  {user.email}
                </Text>
                <Text
                  style={[styles.profileText, { color: activeColors.accent }]}
                >
                  {user.phone}
                </Text>
              </View>
            </>
          )}

          {user.role === "store" && (
            <View style={[styles.storeInfoContainer]}>
              {/* store name */}
              <Text
                style={[styles.storeInfoName, { color: activeColors.accent }]}
              >
                {store.name}
              </Text>
              {/* image */}
              <View style={{ width: "100%", height: 200, padding: 10 }}>
                <ImageSlider images={store.images.map((item) => item.file)} />
              </View>

              {/* Store general info */}
              <View style={styles.storeGeneralInfoContainer}>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>Email:</Text>{" "}
                  {store.email}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>Type:</Text>{" "}
                  {store.type}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Location:
                  </Text>{" "}
                  {store.location}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Operational hour:
                  </Text>{" "}
                  {operationalHourModification(store.openHour)}:
                  {operationalHourModification(store.openMinute)} -{" "}
                  {operationalHourModification(store.closeHour)}:
                  {operationalHourModification(store.closeMinute)}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Pick a worker:
                  </Text>{" "}
                  {store.canChooseWorker ? "Yes" : "No"}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Tolerance time:
                  </Text>{" "}
                  {store.toleranceTime} Minutes
                </Text>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <Pressable
            style={{ position: "absolute", top: 10, right: 10 }}
            onPress={() =>
              user.role === "user"
                ? navigation.navigate("Profile")
                : navigation.navigate("StoreProfile")
            }
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
            styles.switchContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          <View style={styles.switchTextContainer}>
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={activeColors.accent}
            />

            <Text style={[styles.switchText, { color: activeColors.accent }]}>
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
              { backgroundColor: activeColors.accent },
            ]}
          >
            <Text
              style={[styles.logoutText, { color: activeColors.secondary }]}
            >
              Log Out
            </Text>

            <MaterialIcons
              name="logout"
              size={24}
              color={activeColors.secondary}
            />
          </View>
        </Pressable>

        {/* Line */}
        <View
          style={[
            styles.line,
            {
              borderColor: activeColors.secondary,
              backgroundColor: activeColors.secondary,
            },
          ]}
        />

        {/* User's Stores */}
        {user.role === "user" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Stores */}
            <View style={styles.storeContainer}>
              <Text style={[styles.title, { color: activeColors.accent }]}>
                My Stores
              </Text>
              {getUserStores?.stores.map((item, index) => (
                <Store
                  key={index}
                  data={item}
                  refetchData={handleFetchUserStores}
                />
              ))}

              {/* add store */}
              <Pressable
                style={[
                  styles.addStoreContainer,
                  { backgroundColor: activeColors.accent },
                ]}
                onPress={handleAddStore}
              >
                <Text
                  style={{ color: activeColors.secondary, fontWeight: "bold" }}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
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
    borderWidth: 2,
    alignItems: "center",
    marginVertical: 20,
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 30,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  switchTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 19,
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
    fontWeight: "bold",
  },
  line: {
    borderWidth: 1,
    marginVertical: 20,
    padding: 2,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  storeContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 100,
  },
  title: {
    fontSize: 25,
    fontWeight: 500,
    marginBottom: 5,
  },
  addStoreContainer: {
    position: "absolute",
    top: 5,
    right: 50,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  storeInfoContainer: {
    width: "100%",
    flexDirection: "column",
  },
  storeInfoName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  storeGeneralInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  storeGeneralInfoText: {
    fontSize: 17,
    fontWeight: "300",
    marginBottom: 5,
  },
  storeGeneralInfoTextLabel: {
    fontWeight: "bold",
  },
});
