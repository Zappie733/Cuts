import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
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
import { getAppSummary } from "../../Middlewares/AppMiddleware";
import {
  GetAdminRecentActivityResponse,
  GetAppSummaryResponse,
} from "../../Types/ResponseTypes";
import { useFocusEffect } from "@react-navigation/native";
import { getAdminRecentActivity } from "../../Middlewares/UserMiddleware";
import { User } from "../../Contexts/UserContext";
import { Auth } from "../../Contexts/AuthContext";
import { apiCallHandler } from "../../Middlewares/util";

const screenWidth = Dimensions.get("screen").width;

export const AdminHomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getAppSummary({
          auth,
          updateAccessToken,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      setAppData(response.data);
    } else {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const [adminRecentApprove, setAdminRecentApprove] =
    useState<GetAdminRecentActivityResponse>();
  const [adminRecentReject, setAdminRecentReject] =
    useState<GetAdminRecentActivityResponse>();
  const [adminRecentHold, setAdminRecentHold] =
    useState<GetAdminRecentActivityResponse>();
  const [adminRecentUnHold, setAdminRecentUnHold] =
    useState<GetAdminRecentActivityResponse>();

  const handleFetchAdminRecentApprove = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getAdminRecentActivity({
          auth,
          updateAccessToken,
          params: {
            activity: "Approve",
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      setAdminRecentApprove(response.data);
    } else {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const handleFetchAdminRecentReject = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getAdminRecentActivity({
          auth,
          updateAccessToken,
          params: {
            activity: "Reject",
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      setAdminRecentReject(response.data);
    } else {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const handleFetchAdminRecentHold = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getAdminRecentActivity({
          auth,
          updateAccessToken,
          params: {
            activity: "Hold",
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      setAdminRecentHold(response.data);
    } else {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const handleFetchAdminRecentUnHold = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getAdminRecentActivity({
          auth,
          updateAccessToken,
          params: {
            activity: "UnHold",
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      setAdminRecentUnHold(response.data);
    } else {
      console.log(response.status, response.message);
    }

    setLoading(false);
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

      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>

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
              adminRecentApprove.activities.length > 0 &&
              adminRecentApprove.activities.map((item, index) => {
                const approvedDate = new Date(item.approvedDate);
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
                        {item.name}
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
              adminRecentReject.activities.length > 0 &&
              adminRecentReject.activities.map((item, index) => {
                const rejectedDate = new Date(item.rejectedDate);
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
                        {item.name}
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
              adminRecentHold.activities.length > 0 &&
              adminRecentHold.activities.map((item, index) => {
                const holdDate = new Date(item.onHoldDate);
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
                        {item.name}
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
              adminRecentUnHold.activities.length > 0 &&
              adminRecentUnHold.activities.map((item, index) => {
                const unHoldDate = new Date(item.unHoldDate);
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
                        {item.name}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
