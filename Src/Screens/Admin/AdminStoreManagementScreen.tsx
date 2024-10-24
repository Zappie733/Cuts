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
import {
  getApprovedStores,
  getHoldStores,
  getRejectedStores,
  getWaitingForApprovalStores,
} from "../../Middlewares/StoreMiddleware";
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

  const [waitingForApprovalStores, setWaitingForApprovalStores] = useState<
    StoreResponse[]
  >([]);
  const [rejectedStores, setRejectedStores] = useState<StoreResponse[]>([]);
  const [approvedStores, setApprovedStores] = useState<StoreResponse[]>([]);
  const [holdStores, setHoldStores] = useState<StoreResponse[]>([]);

  const handleFetchWaitingForApprovalStores = async () => {
    const response = await getWaitingForApprovalStores(auth, updateAccessToken);

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
      setWaitingForApprovalStores(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchRejectedStores = async () => {
    const response = await getRejectedStores(auth, updateAccessToken);

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
      setRejectedStores(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchApprovedStores = async () => {
    const response = await getApprovedStores(auth, updateAccessToken);

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
      setApprovedStores(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchHoldStores = async () => {
    const response = await getHoldStores(auth, updateAccessToken);

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
      setHoldStores(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  //getStores
  useEffect(() => {
    handleFetchWaitingForApprovalStores();
    handleFetchRejectedStores();
    handleFetchApprovedStores();
    handleFetchHoldStores();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleFetchWaitingForApprovalStores();
        handleFetchRejectedStores();
        handleFetchApprovedStores();
        handleFetchHoldStores();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      handleFetchWaitingForApprovalStores();
      handleFetchRejectedStores();
      handleFetchApprovedStores();
      handleFetchHoldStores();
    }, [])
  );

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  // console.log(selectedStatus);
  const options = [
    { label: "Waiting for Approval", value: "Waiting for Approval" },
    { label: "Approved", value: "Approved" },
    { label: "Hold", value: "Hold" },
    { label: "Rejected", value: "Rejected" },
  ];

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.storeList}>
          {selectedStatus === "Waiting for Approval" &&
            waitingForApprovalStores.map((item, index) => (
              <Store
                key={index}
                data={item}
                refetchData={handleFetchWaitingForApprovalStores}
              />
            ))}
          {selectedStatus === "Rejected" &&
            rejectedStores.map((item, index) => (
              <Store
                key={index}
                data={item}
                refetchData={handleFetchRejectedStores}
              />
            ))}
          {selectedStatus === "Approved" &&
            approvedStores.map((item, index) => (
              <Store
                key={index}
                data={item}
                refetchData={handleFetchApprovedStores}
              />
            ))}
          {selectedStatus === "Hold" &&
            holdStores.map((item, index) => (
              <Store
                key={index}
                data={item}
                refetchData={handleFetchHoldStores}
              />
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
