import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Auth, User } from "../../Contexts";
import { getAppSummary } from "../../Middlewares/AppMiddleware";
import {
  GetAppSummaryResponse,
  IResponseProps,
  StoreResponse,
} from "../../Types/ResponseTypes";
import { logoutUser } from "../../Middlewares/AuthMiddleware";
import { removeDataFromAsyncStorage } from "../../Config/AsyncStorage";
import { IAuthObj } from "../../Types/AuthContextTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { getAdminRecentActivityQueryParams } from "../../Types/AdminHomeScreenTypes";
import { getAdminRecentActivity } from "../../Middlewares/UserMiddleware";

const screenWidth = Dimensions.get("screen").width;

export const AdminHomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { user } = useContext(User);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const defaultAppData: GetAppSummaryResponse = {
    totalUser: 0,
    totalAdmin: 0,
    totalStores: 0,
    totalWaitingForApprovalStores: 0,
    totalRejectedStores: 0,
    totalActiveStores: 0,
    totalInActiveStores: 0,
    totalHoldStores: 0,
  };
  const [appData, setAppData] = useState(defaultAppData);
  // console.log(appData);
  const handleFetchAppSummary = async () => {
    const response = await getAppSummary(auth, updateAccessToken);

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
      setAppData(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const [adminRecentApprove, setAdminRecentApprove] =
    useState<StoreResponse[]>();
  const [adminRecentReject, setAdminRecentReject] = useState<StoreResponse[]>();
  const [adminRecentHold, setAdminRecentHold] = useState<StoreResponse[]>();
  const [adminRecentUnHold, setAdminRecentUnHold] = useState<StoreResponse[]>();

  const handleFetchAdminRecentApprove = async () => {
    const data: getAdminRecentActivityQueryParams = {
      activity: "Approve",
    };
    const response = await getAdminRecentActivity(
      auth,
      updateAccessToken,
      data
    );

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
      setAdminRecentApprove(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchAdminRecentReject = async () => {
    const data: getAdminRecentActivityQueryParams = {
      activity: "Reject",
    };
    const response = await getAdminRecentActivity(
      auth,
      updateAccessToken,
      data
    );

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
      setAdminRecentReject(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchAdminRecentHold = async () => {
    const data: getAdminRecentActivityQueryParams = {
      activity: "Hold",
    };
    const response = await getAdminRecentActivity(
      auth,
      updateAccessToken,
      data
    );

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
      setAdminRecentHold(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  const handleFetchAdminRecentUnHold = async () => {
    const data: getAdminRecentActivityQueryParams = {
      activity: "UnHold",
    };
    const response = await getAdminRecentActivity(
      auth,
      updateAccessToken,
      data
    );

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
      setAdminRecentUnHold(response.data);
    } else {
      console.log(response.status, response.message);
    }
  };

  useEffect(() => {
    handleFetchAppSummary();
    handleFetchAdminRecentApprove();
    handleFetchAdminRecentReject();
    handleFetchAdminRecentHold();
    handleFetchAdminRecentUnHold();
  }, []);

  const firstRenderRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstRenderRef.current) {
        console.log("first render so no need fetch from callback");
        firstRenderRef.current = false;
        return;
      }
      handleFetchAppSummary();
      handleFetchAdminRecentApprove();
      handleFetchAdminRecentReject();
      handleFetchAdminRecentHold();
      handleFetchAdminRecentUnHold();
    }, [])
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: screenWidth }}
      >
        <View style={{ paddingBottom: 100 }}>
          {/* Greeting */}
          <Text style={[styles.greeting, { color: activeColors.tertiary }]}>
            Welcome Back Admin {user.firstName}
          </Text>

          {/* App Information */}
          <View
            style={[
              styles.appSummaryContainer,
              {
                borderColor: activeColors.secondary,
                backgroundColor: activeColors.secondary,
              },
            ]}
          >
            <Text
              style={[styles.appSummaryTitle, { color: activeColors.accent }]}
            >
              Current App Summary
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Admin: {appData.totalAdmin}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total User: {appData.totalUser}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Store: {appData.totalStores}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Waiting for Approval Stores:{" "}
              {appData.totalWaitingForApprovalStores}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Rejected Stores: {appData.totalRejectedStores}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Active Stores: {appData.totalActiveStores}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total InActive Stores: {appData.totalInActiveStores}
            </Text>
            <Text
              style={[
                styles.appSummaryContentText,
                {
                  color: activeColors.accent,
                  borderBottomColor: activeColors.tertiary,
                },
              ]}
            >
              Total Hold Stores: {appData.totalHoldStores}
            </Text>
          </View>

          {/* Recent Approve */}
          <View
            style={[
              styles.recentActivityContainer,
              {
                borderColor: activeColors.secondary,
                backgroundColor: activeColors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.recentActivityTitle,
                { color: activeColors.accent },
              ]}
            >
              Your Recent Approve
            </Text>

            {adminRecentApprove &&
              adminRecentApprove.length > 0 &&
              adminRecentApprove.map((item, index) => {
                const approvedDate = new Date(item.store.approvedDate);
                approvedDate.setHours(approvedDate.getHours() - 7);

                return (
                  <View
                    key={`${index}_Approve`}
                    style={styles.recentActivityContent}
                  >
                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {item.store.name}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {approvedDate.toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>

          {/* Recent Reject */}
          <View
            style={[
              styles.recentActivityContainer,
              {
                borderColor: activeColors.secondary,
                backgroundColor: activeColors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.recentActivityTitle,
                { color: activeColors.accent },
              ]}
            >
              Your Recent Reject
            </Text>

            {adminRecentReject &&
              adminRecentReject.length > 0 &&
              adminRecentReject.map((item, index) => {
                const rejectedDate = new Date(item.store.rejectedDate);
                rejectedDate.setHours(rejectedDate.getHours() - 7);

                return (
                  <View
                    key={`${index}_Reject`}
                    style={styles.recentActivityContent}
                  >
                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {item.store.name}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {rejectedDate.toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>

          {/* Recent Hold */}
          <View
            style={[
              styles.recentActivityContainer,
              {
                borderColor: activeColors.secondary,
                backgroundColor: activeColors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.recentActivityTitle,
                { color: activeColors.accent },
              ]}
            >
              Your Recent Hold
            </Text>

            {adminRecentHold &&
              adminRecentHold.length > 0 &&
              adminRecentHold.map((item, index) => {
                const holdDate = new Date(item.store.onHoldDate);
                holdDate.setHours(holdDate.getHours() - 7);

                return (
                  <View
                    key={`${index}_OnHold`}
                    style={styles.recentActivityContent}
                  >
                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {item.store.name}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {holdDate.toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>

          {/* Recent UnHold */}
          <View
            style={[
              styles.recentActivityContainer,
              {
                borderColor: activeColors.secondary,
                backgroundColor: activeColors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.recentActivityTitle,
                { color: activeColors.accent },
              ]}
            >
              Your Recent UnHold
            </Text>

            {adminRecentUnHold &&
              adminRecentUnHold.length > 0 &&
              adminRecentUnHold.map((item, index) => {
                const unHoldDate = new Date(item.store.unHoldDate);
                unHoldDate.setHours(unHoldDate.getHours() - 7);

                return (
                  <View
                    key={`${index}_UnHold`}
                    style={styles.recentActivityContent}
                  >
                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {item.store.name}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.recentActivityContentText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {unHoldDate.toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
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

  greeting: {
    fontSize: 40,
    fontWeight: "500",
    marginBottom: 40,
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },

  recentActivityContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  recentActivityTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  recentActivityContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentActivityContentText: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
  },

  appSummaryContainer: {
    flexDirection: "column",
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  appSummaryTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  appSummaryContentText: {
    fontSize: 16,
    fontWeight: "400",
    borderBottomWidth: 1,
    marginBottom: 5,
  },
});
