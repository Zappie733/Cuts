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

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken, refetchAuth } = useContext(Auth);

  let { user } = useContext(User);
  useEffect(() => {
    console.log(JSON.stringify(user, null, 2));
  }, [user]);

  const { store, refetchData } = useContext(StoresC);

  const screenWidth = Dimensions.get("screen").width;

  const handleLogout = async () => {
    setLoading(true);
    // console.log("Logout Process");
    const result: IResponseProps = await logoutUser(auth.refreshToken);
    // console.log(JSON.stringify(result, null, 2));

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

    setLoading(false);
  };

  const [getUserStores, setGetUserStores] =
    useState<GetStoresByUserIdResponse>();
  //console.log(JSON.stringify(getUserStores, null, 2));

  const handleFetchUserStores = async () => {
    if (auth._id !== "") {
      setLoading(true);

      const response = await apiCallHandler({
        apiCall: () =>
          getStoresByUserId({
            auth,
            updateAccessToken,
          }),
        auth,
        setAuth,
        navigation,
      });

      if (response.status >= 200 && response.status < 400 && response.data) {
        setGetUserStores(response.data);
      } else {
        console.log(response.status, response.message);
      }

      setLoading(false);
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

  const [ratingSummary, setRatingSummary] =
    useState<GetRatingSummaryByStoreIdResponse>();
  // console.log(JSON.stringify(ratingSummary, null, 2));

  const handleFetchRatingSummary = async () => {
    if (store._id !== "") {
      setLoading(true);

      const response = await apiCallHandler({
        apiCall: () =>
          getRatingSummaryByStoreId({
            auth,
            updateAccessToken,
            params: { storeId: store._id },
          }),
        auth,
        setAuth,
        navigation,
      });

      if (response.status >= 200 && response.status < 400 && response.data) {
        setRatingSummary(response.data);
      } else if (response) {
        console.log(response.status, response.message);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "user") {
      handleFetchUserStores();

      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active") {
            handleFetchUserStores();
          }
        }
      );

      return () => {
        subscription.remove();
      };
    } else if (user.role === "store") {
      handleFetchRatingSummary();

      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active") {
            handleFetchRatingSummary();
          }
        }
      );

      return () => {
        subscription.remove();
      };
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetchAuth();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (user.role === "user") handleFetchUserStores();
      else if (user.role === "store") handleFetchRatingSummary();
    }, [auth])
  );

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

      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>

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
          {(user.role === "user" || user.role === "admin") && (
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
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Operational Status:
                  </Text>{" "}
                  {store.isOpen ? "Open" : "Close"}
                </Text>
                <Text
                  style={[
                    styles.storeGeneralInfoText,
                    { color: activeColors.accent },
                  ]}
                >
                  <Text style={styles.storeGeneralInfoTextLabel}>
                    Store Status:
                  </Text>{" "}
                  {store.status}
                </Text>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <Pressable
            style={{ position: "absolute", top: 10, right: 10 }}
            onPress={() =>
              user.role === "user" || user.role === "admin"
                ? navigation.navigate("Profile")
                : navigation.navigate("StoreProfile")
            }
          >
            <FontAwesome5
              name={user.role === "store" ? "edit" : "user-edit"}
              color={activeColors.accent}
              size={20}
            />
          </Pressable>
        </View>

        {/* liked images, theme and logout for user */}
        {(user.role === "user" || user.role === "admin") && (
          <>
            {/* Liked Images Button */}
            <Pressable onPress={() => navigation.navigate("LikedImages")}>
              <View
                style={[
                  styles.likedImagesContainer,
                  { backgroundColor: activeColors.accent, marginBottom: 20 },
                ]}
              >
                <Ionicons
                  name="images"
                  size={24}
                  color={activeColors.secondary}
                />
                <Text
                  style={[
                    styles.likedImagesText,
                    { color: activeColors.secondary },
                  ]}
                >
                  Liked Images
                </Text>
              </View>
            </Pressable>

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

                <Text
                  style={[styles.switchText, { color: activeColors.accent }]}
                >
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
          </>
        )}

        {/* store order history & ratings */}
        {user.role === "store" && (
          <>
            {/* Order History */}
            <Pressable
              style={[
                styles.orderHistoryButton,
                { backgroundColor: activeColors.accent },
              ]}
              onPress={() => navigation.navigate("StoreOrderHistory")}
            >
              <Text
                style={[
                  styles.orderHistoryButtonText,
                  { color: activeColors.secondary },
                ]}
              >
                Order History
              </Text>

              <Octicons
                name="history"
                size={20}
                color={activeColors.secondary}
              />
            </Pressable>

            {/* Ratings */}
            <View
              style={[
                styles.ratingsContainer,
                { backgroundColor: activeColors.secondary },
              ]}
            >
              {/* title */}
              <Text
                style={[styles.ratingTitle, { color: activeColors.accent }]}
              >
                Overall Ratings Summary
              </Text>

              {/* total per rating */}
              <PerRating
                key={5}
                rating={5}
                totalPerRating={ratingSummary?.totalRating5 ?? 0}
                totalRating={ratingSummary?.totalRating ?? 0}
              />
              <PerRating
                key={4}
                rating={4}
                totalPerRating={ratingSummary?.totalRating4 ?? 0}
                totalRating={ratingSummary?.totalRating ?? 0}
              />
              <PerRating
                key={3}
                rating={3}
                totalPerRating={ratingSummary?.totalRating3 ?? 0}
                totalRating={ratingSummary?.totalRating ?? 0}
              />
              <PerRating
                key={2}
                rating={2}
                totalPerRating={ratingSummary?.totalRating2 ?? 0}
                totalRating={ratingSummary?.totalRating ?? 0}
              />
              <PerRating
                key={1}
                rating={1}
                totalPerRating={ratingSummary?.totalRating1 ?? 0}
                totalRating={ratingSummary?.totalRating ?? 0}
              />

              {/* Total & average rating */}
              <View style={styles.averageRatingContainer}>
                <AntDesign name="star" size={30} color="yellow" />
                <Text
                  style={[
                    styles.averageRatingText,
                    { color: activeColors.accent },
                  ]}
                >
                  Average Rating: {ratingSummary?.averageRating.toFixed(2) ?? 0}{" "}
                  ({ratingSummary?.totalRating} ratings)
                </Text>
              </View>

              <Pressable onPress={() => navigation.navigate("StoreRatings")}>
                <Text
                  style={{
                    color: activeColors.accent,
                    textDecorationLine: "underline",
                  }}
                >
                  See all ratings
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Line */}
        <View
          style={[
            styles.line,
            {
              borderColor: activeColors.tertiary,
              backgroundColor: activeColors.tertiary,
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
                onPress={() => navigation.navigate("RegisterStoreScreen")}
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

        {user.role === "store" && (
          // Management
          <View style={styles.managementContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: activeColors.accent,
                  textAlign: "center",
                  marginBottom: 15,
                },
              ]}
            >
              Management
            </Text>

            <View style={styles.managementOptionsContainer}>
              <View style={styles.managementOptionsRowContainer}>
                <PressableOptions
                  key={"service"}
                  text="Services"
                  fontSize={13}
                  iconName="scissors"
                  iconSource="Entypo"
                  iconSize={38}
                  onPress={() => navigation.navigate("StoreServices")}
                />
                <PressableOptions
                  key={"serviceProduct"}
                  text="Service Products"
                  fontSize={13}
                  iconName="pump-soap"
                  iconSource="FontAwesome5"
                  iconSize={38}
                  onPress={() => navigation.navigate("StoreServiceProducts")}
                />
                <PressableOptions
                  key={"salesProduct"}
                  text="Sales Products"
                  fontSize={13}
                  iconName="shopping-bag-1"
                  iconSource="Fontisto"
                  iconSize={38}
                  onPress={() => navigation.navigate("StoreSalesProducts")}
                />
              </View>

              <View style={styles.managementOptionsRowContainer}>
                <PressableOptions
                  key={"workers"}
                  text="Workers"
                  fontSize={13}
                  iconName="persons"
                  iconSource="Fontisto"
                  iconSize={38}
                  onPress={() => navigation.navigate("StoreWorkers")}
                />
                <PressableOptions
                  key={"promotion"}
                  text="Promotions"
                  fontSize={13}
                  iconSource="MaterialIcons"
                  iconName="discount"
                  iconSize={38}
                  onPress={() => navigation.navigate("StorePromotions")}
                />
                <PressableOptions
                  key={"gallery"}
                  text="Gallery"
                  fontSize={13}
                  iconName="images"
                  iconSource="Ionicons"
                  iconSize={38}
                  onPress={() => navigation.navigate("StoreGallery")}
                />
              </View>
            </View>

            {/* Line */}
            <View
              style={[
                styles.line,
                {
                  borderColor: activeColors.tertiary,
                  backgroundColor: activeColors.tertiary,
                },
              ]}
            />

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

                <Text
                  style={[styles.switchText, { color: activeColors.accent }]}
                >
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
          </View>
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    fontSize: 13,
    fontWeight: "300",
    marginBottom: 5,
  },
  likedImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
    borderRadius: 10,
    paddingVertical: 10,
  },
  likedImagesText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: "500",
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
  orderHistoryButton: {
    flex: 1,
    marginHorizontal: 30,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  orderHistoryButtonText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginRight: 10,
  },
  ratingsContainer: {
    marginHorizontal: 30,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    padding: 20,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  averageRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 5,
  },

  managementContainer: {
    paddingBottom: 20,
  },
  managementOptionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    rowGap: 20,
  },
  managementOptionsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 20,
  },
});
