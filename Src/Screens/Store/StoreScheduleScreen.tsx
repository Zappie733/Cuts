import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { colors } from "../../Config/Theme";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import {
  completeOrder,
  confirmOrder,
  getOrderforSchedule,
  rejectOrder,
} from "../../Middlewares/OrderMiddleware";
import { Store } from "../../Contexts/StoreContext";
import { GetOrderforScheduleResponse } from "../../Types/ResponseTypes/OrderResponse";
import { apiCallHandler } from "../../Middlewares/util";
import { OrderObj } from "../../Types/OrderTypes";
import { ServiceObj } from "../../Types/StoreTypes/ServiceTypes";
import { ServiceProductObj } from "../../Types/StoreTypes/ServiceProductTypes";
import { getUserInfoForOrderById } from "../../Middlewares/UserMiddleware";
import { GetUserInfoForOrderByIdResponse } from "../../Types/ResponseTypes";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { WorkerObj } from "../../Types/StoreTypes/WorkerTypes";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreScheduleScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"StoreSchedule">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { store } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const [orderSchedule, setOrderSchedule] =
    useState<GetOrderforScheduleResponse>();
  const [dates, setDates] = useState<number[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<
    Record<number, OrderObj[]>
  >({});
  // console.log(groupedOrders);
  const [selectedDate, setSelectedDate] = useState<number>();
  const [workersRecord, setWorkersRecord] = useState<Record<string, WorkerObj>>(
    {}
  );
  const [selectedWorker, setSelectedWorker] = useState<string>();
  const [servicesRecord, setServicesRecord] = useState<
    Record<string, ServiceObj>
  >({});
  const [serviceProductsRecord, setServiceProductsRecord] = useState<
    Record<string, ServiceProductObj>
  >({});
  const [userInfoRecord, setUserInfoRecord] = useState<
    Record<string, GetUserInfoForOrderByIdResponse>
  >({});
  const [viewOrderDetail, setViewOrderDetail] =
    useState<Map<string, boolean>>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState("");
  const [reason, setReason] = useState("");

  const getStoreWorkers = () => {
    const workersRecordTemp: Record<string, WorkerObj> = {};
    store.workers.forEach((worker) => {
      if (worker.role === "admin" || worker.role === "others") return;

      workersRecordTemp[worker._id ?? ""] = worker;
    });

    setSelectedWorker(Object.keys(workersRecordTemp)[0]);
    setWorkersRecord(workersRecordTemp);
  };

  const getStoreServices = () => {
    const servicesRecordTemp: Record<string, ServiceObj> = {};

    store.services.forEach((service) => {
      servicesRecordTemp[service._id ?? ""] = service;
    });
    setServicesRecord(servicesRecordTemp);
  };

  const getStoreServiceProducts = () => {
    const serviceProductsRecordTemp: Record<string, ServiceProductObj> = {};

    store.serviceProducts.forEach((serviceProduct) => {
      serviceProductsRecordTemp[serviceProduct._id ?? ""] = serviceProduct;
    });
    setServiceProductsRecord(serviceProductsRecordTemp);
  };

  const handleFetchOrderSchedule = async () => {
    // setLoading(true); //ga enak kalau tiap 20detik ada loader

    const response = await apiCallHandler({
      apiCall: () =>
        getOrderforSchedule({
          auth,
          updateAccessToken,
          params: {
            storeId: store._id,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (
      response &&
      response.status >= 200 &&
      response.status < 400 &&
      response.data
    ) {
      setOrderSchedule(response.data);
    } else if (response) {
      console.log(response.status, response.message);
    }

    // setLoading(false);
  };

  const year = new Date().getFullYear();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[new Date().getMonth()];

  const getDates = () => {
    const today = new Date();
    const newDates: number[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + 7 * 60 * 60 * 1000);
      date.setDate(today.getDate() + i);
      newDates.push(date.getDate());
    }
    setDates(newDates);
    setSelectedDate(newDates[0]);
  };

  const groupOrdersByDate = () => {
    if (!orderSchedule) return;

    const grouped: Record<number, OrderObj[]> = {};
    const orders = orderSchedule.orders;
    dates.forEach((day) => {
      const matchingOrders = orders.filter((order) => {
        const orderDate = new Date(
          new Date(order.date).getTime() - 7 * 60 * 60 * 1000
        ).getDate();

        return orderDate === day;
      });
      grouped[day] = matchingOrders;
    });

    setGroupedOrders(grouped);
  };

  const handleConfirmOrder = async (orderId: string) => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        confirmOrder({
          auth,
          updateAccessToken,
          params: {
            orderId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      handleFetchOrderSchedule();
    } else if (response) {
      // console.log(response.status, response.message);
      Alert.alert("Error", response.message);
    }

    setLoading(false);
  };

  const handleRejectOrder = async (orderId: string) => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        rejectOrder({
          auth,
          updateAccessToken,
          data: {
            orderId,
            rejectedReason: reason,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      handleFetchOrderSchedule();
      setRejectOrderId("");
      setReason("");
      setIsModalVisible(false);
    } else if (response) {
      // console.log(response.status, response.message);
      Alert.alert("Error", response.message);
    }

    setLoading(false);
  };

  const fetchUserInfoForOrderById = async (userId: string) => {
    // setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getUserInfoForOrderById({
          auth,
          updateAccessToken,
          params: {
            userId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (
      response &&
      response.status >= 200 &&
      response.status < 400 &&
      response.data
    ) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }

    // setLoading(false);
  };

  const getUserInfoRecord = async () => {
    const userInfoRecordTemp: Record<string, GetUserInfoForOrderByIdResponse> =
      {};

    const promises = orderSchedule?.orders.map(async (order) => {
      if (order.isManual) return;
      const userInfo = await fetchUserInfoForOrderById(order.userId ?? "");
      userInfoRecordTemp[order.userId ?? ""] = userInfo;
    });

    await Promise.all(promises ?? []);
    setUserInfoRecord(userInfoRecordTemp);
  };

  const toggleOrderDetail = (orderId: string) => {
    setViewOrderDetail((prev) => {
      const newMap = new Map(prev);
      newMap.set(orderId, !newMap.get(orderId)); // Toggle visibility
      return newMap;
    });
  };

  const handleReasonTextChange = (text: string) => {
    // Split the text into lines and add the "- " prefix for each line
    const formattedText = text
      .split("\n") // Split the text by new line
      .map((line) => (line.startsWith("- ") ? line : `- ${line}`)) // Add the "- " prefix if not already present
      .join("\n"); // Join the lines back into a single string

    setReason(formattedText); // Set the updated text
  };

  const handleCompleteOrder = async (orderId: string) => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        completeOrder({
          auth,
          updateAccessToken,
          params: {
            orderId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      handleFetchOrderSchedule();
    } else if (response) {
      Alert.alert("Error", response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getDates();
  }, []);

  useEffect(() => {
    if (store._id) {
      getStoreWorkers();
      getStoreServices();
      getStoreServiceProducts();
    }
  }, [store]);
  //dipisah agar auto refetching hanya terjadi ketika focus pada page ini
  useFocusEffect(
    useCallback(() => {
      if (store._id) {
        handleFetchOrderSchedule();

        const interval = setInterval(() => {
          console.log("refetching order schedule");
          handleFetchOrderSchedule();
        }, 15000); // 15000 ms = 15 seconds

        // Cleanup interval on unmount
        return () => clearInterval(interval);
      }
    }, [store, auth])
  );

  useEffect(() => {
    if (!orderSchedule) return;
    groupOrdersByDate();
    getUserInfoRecord();
  }, [orderSchedule, auth]);

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

      <Text style={[styles.title, { color: activeColors.accent }]}>
        {month} - {year}
      </Text>
      <Text style={[styles.title, { color: activeColors.accent }]}>
        Schedule
      </Text>

      {/* dates */}
      <View style={styles.datesContainer}>
        {dates.map((date, index) => {
          const waitingOrdersCount = groupedOrders[date]?.filter(
            (order) => order.status === "Waiting for Confirmation"
          ).length;

          return (
            <Pressable
              key={index}
              style={[
                styles.dateButton,
                {
                  backgroundColor:
                    selectedDate === date
                      ? activeColors.tertiary
                      : activeColors.secondary,
                  borderColor:
                    selectedDate === date
                      ? activeColors.tertiary
                      : activeColors.secondary,
                },
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={{
                  color:
                    selectedDate === date
                      ? activeColors.primary
                      : activeColors.accent,
                  fontWeight: selectedDate === date ? "600" : "normal",
                }}
              >
                {date.toString()}
              </Text>

              {/* Notification Icon */}
              {waitingOrdersCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: "red",
                    borderRadius: 10,
                    height: 20,
                    width: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {waitingOrdersCount}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* workers tab */}
      <View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {Object.keys(workersRecord).map((workerId, index) => (
            <Pressable
              key={index}
              style={[
                styles.workerButton,
                {
                  backgroundColor:
                    workersRecord[workerId].isOnDuty === false
                      ? activeColors.disabledColor
                      : selectedWorker === workerId
                      ? activeColors.tertiary
                      : activeColors.secondary,
                  borderColor:
                    workersRecord[workerId].isOnDuty === false
                      ? activeColors.disabledColor
                      : selectedWorker === workerId
                      ? activeColors.tertiary
                      : activeColors.secondary,
                },
              ]}
              onPress={() => setSelectedWorker(workerId)}
              // disabled={workersRecord[workerId].isOnDuty === false}
            >
              <Text
                style={{
                  color:
                    workersRecord[workerId].isOnDuty === false
                      ? activeColors.accent
                      : selectedWorker === workerId
                      ? activeColors.primary
                      : activeColors.accent,
                  fontWeight: selectedWorker === workerId ? "600" : "normal",
                }}
              >
                {workersRecord[workerId].firstName +
                  " " +
                  workersRecord[workerId].lastName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* orders */}
      <View
        style={[
          styles.orderContainer,
          { backgroundColor: activeColors.secondary },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedDate !== undefined && groupedOrders[selectedDate]?.length ? (
            groupedOrders[selectedDate].filter(
              (order) => order.workerId === selectedWorker
            ).length ? (
              groupedOrders[selectedDate]
                .filter((order) => order.workerId === selectedWorker)
                .map((order) => (
                  <View
                    key={order._id}
                    style={[
                      styles.order,
                      {
                        backgroundColor: activeColors.primary,
                        borderColor: activeColors.tertiary,
                      },
                    ]}
                  >
                    {/* status */}
                    <View
                      style={[
                        styles.statusContainer,
                        {
                          backgroundColor:
                            order.status === "Waiting for Confirmation"
                              ? "#FFDD57"
                              : order.status === "Waiting for Payment"
                              ? "#FFA07A"
                              : order.status === "Rejected"
                              ? "#FF6F61"
                              : order.status === "Paid"
                              ? "#98FB98"
                              : order.status === "Completed"
                              ? "#37A937"
                              : activeColors.accent,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.status,
                          { color: activeColors.primary, textAlign: "center" },
                        ]}
                      >
                        {order.status === undefined ? "Manual" : order.status}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                      {/* Online flag */}
                      {!order.isManual && (
                        <View style={{ marginBottom: 3 }}>
                          <Text
                            style={{
                              color: activeColors.infoColor,
                              textAlign: "center",
                              fontSize: 18,
                              fontWeight: "300",
                            }}
                          >
                            Online Order
                          </Text>
                        </View>
                      )}

                      {/* duration */}
                      <View style={styles.durationContainer}>
                        <Text
                          style={[
                            styles.durationText,
                            { color: activeColors.accent },
                          ]}
                        >
                          {new Date(order.date).toUTCString().split(" ")[4]} -{" "}
                          {new Date(order.endTime).toUTCString().split(" ")[4]}{" "}
                        </Text>
                        {order.timeDifference && (
                          <Text
                            style={[
                              styles.timeDifferenceText,
                              { color: activeColors.infoColor },
                            ]}
                          >
                            {order.timeDifference && order.timeDifference > 0
                              ? `${order.timeDifference} minutes slower than expected`
                              : order.timeDifference && order.timeDifference < 0
                              ? `${Math.abs(
                                  order.timeDifference
                                )} minutes faster than expected`
                              : ""}
                          </Text>
                        )}
                      </View>

                      {/* User Info */}
                      <View style={styles.userInfoContainer}>
                        {order.userName ? (
                          <Text
                            style={[
                              styles.userInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {order.userName}
                          </Text>
                        ) : (
                          <View>
                            <Text
                              style={[
                                styles.userInfoText,
                                { color: activeColors.accent },
                              ]}
                            >
                              {userInfoRecord[order.userId ?? ""]
                                ? userInfoRecord[order.userId ?? ""]
                                    ?.firstName +
                                  " " +
                                  userInfoRecord[order.userId ?? ""]?.lastName
                                : ""}
                            </Text>
                            <Text
                              style={[
                                styles.userInfoText,
                                { color: activeColors.accent },
                              ]}
                            >
                              {userInfoRecord[order.userId ?? ""]?.phone}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            height: 3,
                            marginRight: 5,
                            backgroundColor: activeColors.tertiary,
                          }}
                        />
                        {/* Toggle Icon */}

                        <Pressable
                          onPress={() => toggleOrderDetail(order._id ?? "")}
                        >
                          <Text style={{ color: activeColors.secondary }}>
                            {viewOrderDetail?.get(order._id ?? "") ? (
                              <AntDesign
                                name="caretdown"
                                size={20}
                                color={activeColors.secondary}
                              />
                            ) : (
                              <AntDesign
                                name="caretright"
                                size={20}
                                color={activeColors.secondary}
                              />
                            )}
                          </Text>
                        </Pressable>
                      </View>

                      {viewOrderDetail?.get(order._id ?? "") && (
                        <>
                          {/* services & service products */}
                          <View>
                            {order.serviceIds.map((serviceId, index) => (
                              <View key={index}>
                                {/* service */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginVertical: 5,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: activeColors.accent,
                                    }}
                                  >
                                    {servicesRecord[serviceId]?.name}
                                  </Text>
                                  <Text
                                    style={{
                                      color: activeColors.accent,
                                    }}
                                  >
                                    {servicesRecord[serviceId]?.duration} min
                                  </Text>

                                  {servicesRecord[serviceId]?.discount &&
                                  servicesRecord[serviceId]?.discount > 0 ? (
                                    <Text
                                      style={{
                                        color: activeColors.accent,
                                      }}
                                    >
                                      Rp.
                                      {((100 -
                                        servicesRecord[serviceId]?.discount) *
                                        servicesRecord[serviceId]?.price) /
                                        100}{" "}
                                      ({servicesRecord[serviceId]?.discount}%
                                      off)
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        color: activeColors.accent,
                                      }}
                                    >
                                      Rp.{servicesRecord[serviceId]?.price}
                                    </Text>
                                  )}
                                </View>

                                {/* service products line */}
                                {servicesRecord[serviceId]?.serviceProduct &&
                                  servicesRecord[serviceId]?.serviceProduct
                                    .length > 0 && (
                                    <View
                                      style={{
                                        flex: 1,
                                        padding: 1,
                                        backgroundColor: activeColors.tertiary,
                                        marginLeft: 30,
                                        marginVertical: 1,
                                      }}
                                    />
                                  )}
                                {/* service products */}
                                <View
                                  style={{
                                    flexDirection: "column",
                                    marginVertical: 2,
                                    marginLeft: 30,
                                  }}
                                >
                                  {servicesRecord[serviceId].serviceProduct
                                    ?.filter((productId) => {
                                      const serviceProduct =
                                        serviceProductsRecord[productId];
                                      return (
                                        order.chosenServiceProductsIds
                                          ?.find(
                                            (id) =>
                                              id.serviceId.toString() ===
                                              serviceId.toString()
                                          )
                                          ?.serviceProductIds.includes(
                                            productId
                                          ) ||
                                        serviceProduct.isAnOption === false
                                      );
                                    })
                                    .map((productId, index) => (
                                      <View
                                        key={index}
                                        style={{
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          marginVertical: 3,
                                          paddingLeft: 10,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: activeColors.accent,
                                          }}
                                        >
                                          {
                                            serviceProductsRecord[productId]
                                              ?.name
                                          }
                                        </Text>
                                        <Text
                                          style={{
                                            color: activeColors.accent,
                                          }}
                                        >
                                          Rp.
                                          {serviceProductsRecord[productId]
                                            ?.addtionalPrice ?? 0}
                                        </Text>
                                      </View>
                                    ))}
                                </View>

                                <View
                                  style={{
                                    flex: 1,
                                    padding: 1,
                                    backgroundColor: activeColors.tertiary,
                                  }}
                                />
                              </View>
                            ))}
                          </View>

                          {/* Estimate Time &Total price */}
                          <View style={styles.estimateNTotalContainer}>
                            <View>
                              <Text
                                style={[
                                  styles.estimateNTotalText,
                                  { color: activeColors.accent },
                                ]}
                              >
                                Estimated Time: {order.totalDuration} min
                              </Text>
                            </View>
                            <View>
                              <Text
                                style={[
                                  styles.estimateNTotalText,
                                  { color: activeColors.accent },
                                ]}
                              >
                                Total: Rp.{order.totalPrice}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>

                    {/* actions */}
                    {order.status === "Waiting for Confirmation" && (
                      <View style={styles.actionsContainer}>
                        <Pressable
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: activeColors.accent,
                              borderColor: "green",
                            },
                          ]}
                          onPress={() =>
                            Alert.alert(
                              "Confirm Order",
                              "Are you sure to confirm this order?",
                              [
                                {
                                  text: "OK",
                                  onPress: () =>
                                    handleConfirmOrder(order._id ?? ""),
                                },
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                  onPress: () => console.log("Cancel Pressed"),
                                },
                              ]
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: activeColors.secondary },
                            ]}
                          >
                            Confirm
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: activeColors.accent,
                              borderColor: "red",
                            },
                          ]}
                          onPress={() => {
                            setIsModalVisible(true);
                            setRejectOrderId(order._id ?? "");
                          }}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: activeColors.secondary },
                            ]}
                          >
                            Reject
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    {(order.status === "Paid" ||
                      order.status === undefined) && (
                      <View style={styles.actionsContainer}>
                        <Pressable
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: activeColors.accent,
                              borderColor: "green",
                            },
                          ]}
                          onPress={() =>
                            Alert.alert(
                              "Complete Order",
                              "Are you sure to complete this order?",
                              [
                                {
                                  text: "OK",
                                  onPress: () =>
                                    handleCompleteOrder(order._id ?? ""),
                                },
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                  onPress: () => console.log("Cancel Pressed"),
                                },
                              ]
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: activeColors.secondary },
                            ]}
                          >
                            Complete
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))
            ) : (
              <Text style={{ textAlign: "center", color: activeColors.accent }}>
                No orders for{" "}
                {workersRecord[selectedWorker ?? ""].firstName +
                  " " +
                  workersRecord[selectedWorker ?? ""].lastName}
                .
              </Text>
            )
          ) : (
            <Text style={{ textAlign: "center", color: activeColors.accent }}>
              No orders for this date.
            </Text>
          )}
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {/* Title */}
            <Text
              style={[
                styles.modalTitle,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Reject Order
            </Text>

            {/* Text Input */}
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  color: activeColors.accent,
                  borderColor: activeColors.tertiary,
                  backgroundColor: activeColors.secondary,
                },
              ]}
              placeholder="Enter reasons, make a new line for every reason."
              placeholderTextColor={activeColors.primary}
              multiline={true}
              numberOfLines={5}
              onChangeText={(text) => handleReasonTextChange(text)}
              value={reason}
            />

            {/* Submit Button */}
            <Pressable
              style={[
                styles.modalSubmitButton,
                {
                  backgroundColor: activeColors.accent,
                },
              ]}
              onPress={() =>
                Alert.alert(
                  "Reject Order",
                  "Are you sure to reject this order?",
                  [
                    {
                      text: "OK",
                      onPress: () => handleRejectOrder(rejectOrderId ?? ""),
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                      onPress: () => console.log("Cancel Pressed"),
                    },
                  ]
                )
              }
            >
              <Text
                style={[
                  styles.modalSubmitButtonText,
                  { color: activeColors.secondary },
                ]}
              >
                Submit
              </Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setIsModalVisible(false);
                setRejectOrderId("");
                setReason("");
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 25,
    textAlign: "center",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  dateButton: {
    margin: 10,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 1,
  },
  workerButton: {
    margin: 10,
    height: 40,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  orderContainer: {
    flex: 1,
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    marginBottom: 100,
  },
  order: {
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusContainer: {
    borderRadius: 5,
    padding: 2,
    marginBottom: 10,
  },
  status: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontWeight: "bold",
    fontSize: 15,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    marginLeft: 10,
  },
  actionButtonText: {
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 10,
  },
  durationContainer: {
    marginBottom: 3,
  },
  durationText: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  timeDifferenceText: {
    fontSize: 16,
    textAlign: "center",
  },
  userInfoContainer: {
    marginBottom: 5,
  },
  userInfoText: {
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
  estimateNTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    alignItems: "center",
  },
  estimateNTotalText: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  modalTextInput: {
    marginTop: 10,
    fontSize: 15,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    textAlignVertical: "top",
    height: 120,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalSubmitButton: {
    width: "100%",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
