import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  AppState,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";
import { IResponseProps, StoreResponse } from "../../Types/ResponseTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { Auth } from "../../Contexts";
import { getStoresByStatus } from "../../Middlewares/StoreMiddleware";
import { logoutUser } from "../../Middlewares/AuthMiddleware";
import { removeDataFromAsyncStorage } from "../../Config/AsyncStorage";
import { IAuthObj } from "../../Types/AuthContextTypes";
import { Header } from "../../Components/Header";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { set } from "mongoose";
import { Store } from "../../Components/Store";

const screenWidth = Dimensions.get("screen").width;

export const AdminStoreManagementScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"StoreManagement">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const limit = 10;
  const [refectch, setRefetch] = useState<boolean>(false);

  const handleFetchStores = async () => {
    const data = {
      limit,
      offset: offset,
      status: selectedStatus as
        | "Waiting for Approval"
        | "Rejected"
        | "Active"
        | "InActive"
        | "Hold",
    };
    console.log(data);
    const response = await getStoresByStatus(auth, updateAccessToken, data);

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
      // setStores(response.data);
      setStores((prevStores) => [...prevStores, ...(response.data || [])]);
      setOffset(offset + limit);
      setRefetch(false);
    } else {
      console.log(response.status, response.message);
    }
  };

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  // console.log(selectedStatus);
  const options = [
    { label: "All", value: "" },
    { label: "Waiting for Approval", value: "Waiting for Approval" },
    { label: "Active", value: "Active" },
    { label: "InActive", value: "InActive" },
    { label: "Hold", value: "Hold" },
    { label: "Rejected", value: "Rejected" },
  ];

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isNearBottom && refectch === false) {
      setRefetch(true);
      setTimeout(() => {
        handleFetchStores();
      }, 1000);
    }
  };

  //getStores
  useEffect(() => {
    setOffset(0);
    setStores([]);
  }, [selectedStatus]);
  useEffect(() => {
    if (offset === 0) handleFetchStores();
    // const subscription = AppState.addEventListener("change", (nextAppState) => {
    //   if (nextAppState === "active") {
    //     handleFetchStores();
    //   }
    // });

    // return () => {
    //   subscription.remove();
    // };
  }, [offset]);
  useFocusEffect(
    useCallback(() => {
      console.log("a");
      setSelectedStatus("");
    }, [])
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      <View
        style={[
          styles.navContainer,
          {
            backgroundColor: activeColors.secondary,
            shadowColor: activeColors.tertiary,
          },
        ]}
      >
        <DropdownPicker
          options={options}
          selectedValue={selectedStatus}
          onValueChange={setSelectedStatus}
          placeHolder="Select Store Status..."
          isInput={false}
        />
      </View>

      {/* Store Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, { color: activeColors.tertiary }]}>
          {selectedStatus} Stores
        </Text>
      </View>

      {/* Line */}
      <View
        style={[
          styles.line,
          {
            borderColor: activeColors.secondary,
            backgroundColor: activeColors.tertiary,
          },
        ]}
      ></View>

      {/* Store List */}
      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll}>
        <View style={styles.storeList}>
          {stores.map((item, index) => (
            <Store key={index} data={item} refetchData={handleFetchStores} />
          ))}
        </View>
      </ScrollView>
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
  navContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999,
  },
  titleContainer: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 24,
  },
  line: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 1,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  storeList: {
    flexDirection: "column",
    alignItems: "center",
  },
});
