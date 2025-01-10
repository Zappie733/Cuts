import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  ToastAndroid,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Theme } from "../Contexts/ThemeContext";
import { colors } from "../Config/Theme";
import { Auth } from "../Contexts/AuthContext";
import { Header } from "../Components/Header";
import { Store } from "../Contexts/StoreContext";
import { StoreObj } from "../Types/StoreTypes/StoreTypes";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { Orders } from "../Contexts/OrderContext";
import {
  GetServiceInfoforOrderByIdResponse,
  GetServiceProductsInfoForOrderByIdResponse,
  GetStoreInfoForOrderByIdResponse,
  GetWorkerInfoForOrderByIdResponse,
} from "../Types/ResponseTypes/StoreResponse";
import { apiCallHandler } from "../Middlewares/util";
import { getStoreInfoForOrderById } from "../Middlewares/StoreMiddleware/StoreMiddleware";
import { getWorkersInfoForOrderById } from "../Middlewares/StoreMiddleware/WorkerMiddleware";
import { getServiceInfoforOrderById } from "../Middlewares/StoreMiddleware/ServiceMiddleware";
import { getServiceProductsInfoForOrderById } from "../Middlewares/StoreMiddleware/ServiceProductMiddleware";
import { DropdownPicker } from "../Components/DropdownPicker";
import {
  addOrder,
  cancelOrder,
  getOrdersByStatus,
} from "../Middlewares/OrderMiddleware";
import { set } from "mongoose";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { DateTimePickerComponent } from "../Components/DateTimePicker";
import { GetOrdersByStatusResponse } from "../Types/ResponseTypes/OrderResponse";
import CountdownTimer from "../Components/CountdownTimer";
import { useFocusEffect } from "@react-navigation/native";
import { User } from "../Contexts/UserContext";
import { useTimer } from "../Contexts/TimerContext";

const screenWidth = Dimensions.get("screen").width;

export const OrderScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Order">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken, refetchAuth } = useContext(Auth);

  useEffect(() => {
    refetchAuth();

    const interval = setInterval(() => {
      refetchAuth();
    }, 10000); //10 detik
    return () => clearInterval(interval);
  }, []);

  const { user, setUser } = useContext(User);
  const { store, setStore } = useContext(Store);
  const { orders, setOrders } = useContext(Orders);
  const { clearTimer, timers, intervals } = useTimer();

  useFocusEffect(
    useCallback(() => {
      // console.log("timers", JSON.stringify(timers, null, 2));
      // console.log("intervals", JSON.stringify(intervals, null, 2));
    }, [timers, intervals])
  );
  // console.log("orders", JSON.stringify(orders, null, 2));

  // const { stopTimer } = useTimer();

  const priceFormat = (price: number) => {
    let priceStr = price.toString();
    let newStr = "";
    let lastIndex = 3;
    while (priceStr.length > lastIndex) {
      newStr =
        priceStr.slice(0, priceStr.length - lastIndex) +
        "." +
        priceStr.slice(-lastIndex);

      lastIndex += 3;
    }
    if (newStr === "") return priceStr;
    return newStr;
  };

  const handleCopy = (value: string, label: string) => {
    Clipboard.setStringAsync(value); // Copies the text to clipboard
    ToastAndroid.show(`${label} Copied!`, ToastAndroid.SHORT); // Show a toast message
  };

  const [storesInfoRecord, setStoresInfoRecord] = useState<
    Record<string, GetStoreInfoForOrderByIdResponse>
  >({});
  // console.log(JSON.stringify(storesInfoRecord, null, 2));
  const [workersInfoRecord, setWorkersInfoRecord] = useState<
    Record<string, GetWorkerInfoForOrderByIdResponse>
  >({});
  // console.log(JSON.stringify(workersInfoRecord, null, 2));
  const [servicesInfoRecord, setServicesInfoRecord] = useState<
    Record<string, GetServiceInfoforOrderByIdResponse[]>
  >({});
  // console.log(JSON.stringify(servicesInfoRecord, null, 2));
  const [serviceProductsInfoRecord, setServiceProductsInfoRecord] = useState<
    Record<string, GetServiceProductsInfoForOrderByIdResponse[]>
  >({});
  // console.log(JSON.stringify(serviceProductsInfoRecord, null, 2));

  const [step, setStep] = useState(1);

  const [WaitingForConfirmationOrders, setWaitingForConfirmationOrders] =
    useState<GetOrdersByStatusResponse>({ orders: [], total: 0 });
  // console.log(
  //   "Waiting for Confirmation",
  //   JSON.stringify(WaitingForConfirmationOrders, null, 2)
  // );

  const [WaitingForPaymentOrders, setWaitingForPaymentOrders] =
    useState<GetOrdersByStatusResponse>({ orders: [], total: 0 });
  // console.log(
  //   "Waiting for Payment",
  //   JSON.stringify(WaitingForPaymentOrders, null, 2)
  // );

  const [onGoingOrders, setOnGoingOrders] = useState<GetOrdersByStatusResponse>(
    { orders: [], total: 0 }
  );
  // console.log("On Going", JSON.stringify(onGoingOrders, null, 2));

  const handleGetStoreInfoForOrderById = async (storeId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getStoreInfoForOrderById({
          auth,
          updateAccessToken,
          params: {
            storeId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleGetWorkersInfoForOrderById = async (storeId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getWorkersInfoForOrderById({
          auth,
          updateAccessToken,
          params: {
            storeId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleGetServiceInfoforOrderById = async (
    storeId: string,
    serviceId: string
  ) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getServiceInfoforOrderById({
          auth,
          updateAccessToken,
          params: {
            storeId,
            serviceId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleGetServiceProductsInfoForOrderById = async (
    storeId: string,
    serviceProductId: string
  ) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getServiceProductsInfoForOrderById({
          auth,
          updateAccessToken,
          params: {
            storeId,
            serviceProductId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const getALlData = async () => {
    // setLoading(true);

    const storesInfoRecordTemp: Record<
      string,
      GetStoreInfoForOrderByIdResponse
    > = {};

    const workersInfoRecordTemp: Record<
      string,
      GetWorkerInfoForOrderByIdResponse
    > = {};

    const servicesInfoRecordTemp: Record<
      string,
      GetServiceInfoforOrderByIdResponse[]
    > = {};

    const serviceProductsInfoRecordTemp: Record<
      string,
      GetServiceProductsInfoForOrderByIdResponse[]
    > = {};

    // for (const order of orders) {
    //   const storeInfo = await handleGetStoreInfoForOrderById(order.storeId ?? "");
    //   storeInfoRecordTemp[order.storeId ?? ""] = storeInfo;
    // }

    const promises = orders.map(async (order) => {
      //storeInfo
      const storeInfo = await handleGetStoreInfoForOrderById(
        order.storeId ?? ""
      );

      storesInfoRecordTemp[order.storeId ?? ""] = storeInfo;

      //workersInfo
      const workersInfo = await handleGetWorkersInfoForOrderById(
        order.storeId ?? ""
      );

      workersInfoRecordTemp[order.storeId ?? ""] = workersInfo;

      //servicesInfo
      for (const serviceId of order.serviceIds) {
        const serviceInfo = await handleGetServiceInfoforOrderById(
          order.storeId ?? "",
          serviceId
        );

        servicesInfoRecordTemp[order.storeId ?? ""] = [
          ...(servicesInfoRecordTemp[order.storeId ?? ""] ?? []),
          serviceInfo,
        ];
      }

      //serviceProductsInfo
      for (const obj of order.chosenServiceProductsIds ?? []) {
        for (const serviceProductId of obj.serviceProductIds) {
          const serviceProductInfo =
            await handleGetServiceProductsInfoForOrderById(
              order.storeId ?? "",
              serviceProductId
            );

          serviceProductsInfoRecordTemp[order.storeId ?? ""] = [
            ...(serviceProductsInfoRecordTemp[order.storeId ?? ""] ?? []),
            { ...serviceProductInfo, serviceId: obj.serviceId },
          ];
        }
      }
    });

    await Promise.all(promises ?? []);

    if (WaitingForConfirmationOrders) {
      const promisesForStatus = WaitingForConfirmationOrders.orders.map(
        async (order) => {
          //storeInfo
          const storeInfo = await handleGetStoreInfoForOrderById(
            order.storeId ?? ""
          );

          storesInfoRecordTemp[order._id ?? ""] = storeInfo;

          //workersInfo
          const workersInfo = await handleGetWorkersInfoForOrderById(
            order.storeId ?? ""
          );

          workersInfoRecordTemp[order._id ?? ""] = workersInfo;

          //servicesInfo
          for (const serviceId of order.serviceIds) {
            const serviceInfo = await handleGetServiceInfoforOrderById(
              order.storeId ?? "",
              serviceId
            );

            servicesInfoRecordTemp[order._id ?? ""] = [
              ...(servicesInfoRecordTemp[order._id ?? ""] ?? []),
              serviceInfo,
            ];
          }

          //serviceProductsInfo
          for (const obj of order.chosenServiceProductsIds ?? []) {
            for (const serviceProductId of obj.serviceProductIds) {
              const serviceProductInfo =
                await handleGetServiceProductsInfoForOrderById(
                  order.storeId ?? "",
                  serviceProductId
                );

              serviceProductsInfoRecordTemp[order._id ?? ""] = [
                ...(serviceProductsInfoRecordTemp[order._id ?? ""] ?? []),
                { ...serviceProductInfo, serviceId: obj.serviceId },
              ];
            }
          }
        }
      );

      await Promise.all(promisesForStatus ?? []);
    }

    if (WaitingForPaymentOrders) {
      const promisesForStatus = WaitingForPaymentOrders.orders.map(
        async (order) => {
          //storeInfo
          const storeInfo = await handleGetStoreInfoForOrderById(
            order.storeId ?? ""
          );

          storesInfoRecordTemp[order._id ?? ""] = storeInfo;

          //workersInfo
          const workersInfo = await handleGetWorkersInfoForOrderById(
            order.storeId ?? ""
          );

          workersInfoRecordTemp[order._id ?? ""] = workersInfo;

          //servicesInfo
          for (const serviceId of order.serviceIds) {
            const serviceInfo = await handleGetServiceInfoforOrderById(
              order.storeId ?? "",
              serviceId
            );

            servicesInfoRecordTemp[order._id ?? ""] = [
              ...(servicesInfoRecordTemp[order._id ?? ""] ?? []),
              serviceInfo,
            ];
          }

          //serviceProductsInfo
          for (const obj of order.chosenServiceProductsIds ?? []) {
            for (const serviceProductId of obj.serviceProductIds) {
              const serviceProductInfo =
                await handleGetServiceProductsInfoForOrderById(
                  order.storeId ?? "",
                  serviceProductId
                );

              serviceProductsInfoRecordTemp[order._id ?? ""] = [
                ...(serviceProductsInfoRecordTemp[order._id ?? ""] ?? []),
                { ...serviceProductInfo, serviceId: obj.serviceId },
              ];
            }
          }
        }
      );

      await Promise.all(promisesForStatus ?? []);
    }

    if (onGoingOrders) {
      const promisesForStatus = onGoingOrders.orders.map(async (order) => {
        //storeInfo
        const storeInfo = await handleGetStoreInfoForOrderById(
          order.storeId ?? ""
        );

        storesInfoRecordTemp[order._id ?? ""] = storeInfo;

        //workersInfo
        const workersInfo = await handleGetWorkersInfoForOrderById(
          order.storeId ?? ""
        );

        workersInfoRecordTemp[order._id ?? ""] = workersInfo;

        //servicesInfo
        for (const serviceId of order.serviceIds) {
          const serviceInfo = await handleGetServiceInfoforOrderById(
            order.storeId ?? "",
            serviceId
          );

          servicesInfoRecordTemp[order._id ?? ""] = [
            ...(servicesInfoRecordTemp[order._id ?? ""] ?? []),
            serviceInfo,
          ];
        }

        //serviceProductsInfo
        for (const obj of order.chosenServiceProductsIds ?? []) {
          for (const serviceProductId of obj.serviceProductIds) {
            const serviceProductInfo =
              await handleGetServiceProductsInfoForOrderById(
                order.storeId ?? "",
                serviceProductId
              );

            serviceProductsInfoRecordTemp[order._id ?? ""] = [
              ...(serviceProductsInfoRecordTemp[order._id ?? ""] ?? []),
              { ...serviceProductInfo, serviceId: obj.serviceId },
            ];
          }
        }
      });

      await Promise.all(promisesForStatus ?? []);
    }
    setStoresInfoRecord(storesInfoRecordTemp);
    setWorkersInfoRecord(workersInfoRecordTemp);
    setServicesInfoRecord(servicesInfoRecordTemp);
    setServiceProductsInfoRecord(serviceProductsInfoRecordTemp);

    // setLoading(false);
  };

  const handleCreateOrder = async (storeId: string) => {
    setLoading(true);

    const orderData = orders.find((order) => order.storeId === storeId);
    console.log(orderData);
    if (!orderData) return;

    let processedOrderData = orderData;

    if (orderData.date) {
      const dateInstance = new Date(orderData.date);
      if (!isNaN(dateInstance.getTime())) {
        processedOrderData = {
          ...orderData,
          date: new Date(dateInstance.getTime() + 7 * 60 * 60 * 1000),
        };
      } else {
        console.error("Invalid date format in orderData.date");
      }
    }

    const response = await apiCallHandler({
      apiCall: () =>
        addOrder({
          auth,
          updateAccessToken,
          data: processedOrderData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setOrders(orders.filter((order) => order.storeId !== storeId));
      setTimeout(() => {
        setStep(2);
      }, 250);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const waitingForConfirmationRef = useRef(WaitingForConfirmationOrders);
  useEffect(() => {
    waitingForConfirmationRef.current = WaitingForConfirmationOrders;
  }, [WaitingForConfirmationOrders]);

  const waitingForPaymentRef = useRef(WaitingForPaymentOrders);
  useEffect(() => {
    waitingForPaymentRef.current = WaitingForPaymentOrders;
  }, [WaitingForPaymentOrders]);

  const onGoingRef = useRef(onGoingOrders);
  useEffect(() => {
    onGoingRef.current = onGoingOrders;
  }, [onGoingOrders]);

  const handleGetOrdersByStatus = async (status: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getOrdersByStatus({ auth, updateAccessToken, params: { status } }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      if (
        status === "Waiting for Payment" ||
        status === "Waiting for Confirmation"
      ) {
        const currentOrders: GetOrdersByStatusResponse =
          status === "Waiting for Confirmation"
            ? waitingForConfirmationRef.current
            : waitingForPaymentRef.current;

        const newOrders: GetOrdersByStatusResponse = response.data;

        // Find orders to remove
        const ordersToRemove = currentOrders.orders.filter(
          (currentOrder) =>
            !newOrders.orders.some(
              (newOrder) => newOrder._id === currentOrder._id
            )
        );

        // Clear timers for removed orders
        ordersToRemove.forEach((order) => {
          console.log(`Clearing timer for removed order ID: ${order._id}`);
          clearTimer(order._id as string); // Assumes each order has a unique `id`
        });

        if (
          status === "Waiting for Confirmation" &&
          ordersToRemove.length > 0
        ) {
          setStep(3);
        }

        if (status === "Waiting for Payment" && ordersToRemove.length > 0) {
          setTimeout(() => {
            setStep(4);
          }, 1000);
        }
      }

      if (
        status === "Waiting for Confirmation" &&
        JSON.stringify(response.data) !==
          JSON.stringify(waitingForConfirmationRef.current)
      ) {
        console.log(
          "WAITING FOR CONFIRMATION RESPONSE DATA:",
          JSON.stringify(response.data, null, 2)
        );
        console.log(
          "CURRENT WAITING FOR CONFIRMATION ORDERS:",
          JSON.stringify(waitingForConfirmationRef.current, null, 2)
        );
        //clearTimer when the order is in current but not in response data

        setWaitingForConfirmationOrders(response.data);
      } else if (
        status === "Waiting for Payment" &&
        JSON.stringify(response.data) !==
          JSON.stringify(waitingForPaymentRef.current)
      ) {
        console.log(
          "WAITING FOR PAYMENT RESPONSE DATA:",
          JSON.stringify(response.data, null, 2)
        );
        console.log(
          "CURRENT WAITING FOR PAYMENT ORDERS:",
          JSON.stringify(waitingForPaymentRef.current, null, 2)
        );
        setWaitingForPaymentOrders(response.data);
      } else if (
        status === "Paid" &&
        JSON.stringify(response.data) !== JSON.stringify(onGoingRef.current)
      ) {
        console.log(
          "ON GOING RESPONSE DATA:",
          JSON.stringify(response.data, null, 2)
        );
        console.log(
          "CURRENT ON GOING ORDERS:",
          JSON.stringify(onGoingRef.current, null, 2)
        );
        setOnGoingOrders(response.data);
      }
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  //jalan saat mount dan saat create order
  useEffect(() => {
    handleGetOrdersByStatus("Waiting for Confirmation");
    handleGetOrdersByStatus("Waiting for Payment");
    handleGetOrdersByStatus("Paid");

    const intervalId = setInterval(() => {
      handleGetOrdersByStatus("Waiting for Confirmation");
      handleGetOrdersByStatus("Waiting for Payment");
      handleGetOrdersByStatus("Paid");
    }, 5000); // 5 detik

    return () => clearInterval(intervalId);
  }, [orders]);

  //jalan saat mount dan setiap WaitingForConfirmationOrders berubah
  useEffect(() => {
    getALlData();
  }, [WaitingForConfirmationOrders, WaitingForPaymentOrders, onGoingOrders]);

  // useEffect(() => {
  //   handleGetOrdersByStatus("Waiting for Payment");
  // }, [WaitingForConfirmationOrders]);

  // useEffect(() => {
  //   handleGetOrdersByStatus("Paid");
  // }, [WaitingForPaymentOrders]);

  const handleCancelOrder = async (orderId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        cancelOrder({ auth, updateAccessToken, params: { orderId } }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      handleGetOrdersByStatus("Waiting for Confirmation");
      handleGetOrdersByStatus("Waiting for Payment");
      Alert.alert("Success", response.message);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

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

      {/* Tabs */}
      <View
        style={[styles.tabsContainer, { borderColor: activeColors.tertiary }]}
      >
        <Pressable style={styles.tabsItem} onPress={() => setStep(1)}>
          <View
            style={[
              styles.tabsItemNumber,
              {
                backgroundColor:
                  step === 1 ? activeColors.infoColor : activeColors.accent,
              },
            ]}
          >
            <Text style={{ color: activeColors.primary, fontWeight: "bold" }}>
              1
            </Text>
          </View>
          <View>
            <Text style={[styles.tabsItemText, { color: activeColors.accent }]}>
              Make Order
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.tabsItem} onPress={() => setStep(2)}>
          <View
            style={[
              styles.tabsItemNumber,
              {
                backgroundColor:
                  step === 2 ? activeColors.infoColor : activeColors.accent,
              },
            ]}
          >
            <Text style={{ color: activeColors.primary, fontWeight: "bold" }}>
              2
            </Text>
          </View>
          <View>
            <Text style={[styles.tabsItemText, { color: activeColors.accent }]}>
              Confirmation
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.tabsItem} onPress={() => setStep(3)}>
          <View
            style={[
              styles.tabsItemNumber,
              {
                backgroundColor:
                  step === 3 ? activeColors.infoColor : activeColors.accent,
              },
            ]}
          >
            <Text style={{ color: activeColors.primary, fontWeight: "bold" }}>
              3
            </Text>
          </View>
          <View>
            <Text style={[styles.tabsItemText, { color: activeColors.accent }]}>
              Payment
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.tabsItem} onPress={() => setStep(4)}>
          <View
            style={[
              styles.tabsItemNumber,
              {
                backgroundColor:
                  step === 4 ? activeColors.infoColor : activeColors.accent,
              },
            ]}
          >
            <Text style={{ color: activeColors.primary, fontWeight: "bold" }}>
              4
            </Text>
          </View>
          <View>
            <Text style={[styles.tabsItemText, { color: activeColors.accent }]}>
              On Going
            </Text>
          </View>
        </Pressable>
      </View>

      {step === 1 && (
        <>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: activeColors.tertiary,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: activeColors.accent,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Make Order stage notes
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Customer can only cancel the order before the payment is made
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Can not make order from the same store until the previous
              order(from the same store) is at least in the On Going stage
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginHorizontal: 20 }}
            nestedScrollEnabled={true}
          >
            <View style={{ paddingBottom: 80 }}>
              {orders.map((order, index) => (
                <View
                  key={index}
                  style={[
                    styles.orderContainer,
                    { borderColor: activeColors.tertiary },
                  ]}
                >
                  {/* store name */}
                  <View
                    style={[
                      styles.orderStoreName,
                      { borderColor: activeColors.tertiary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStoreNameText,
                        {
                          color: activeColors.accent,
                        },
                      ]}
                    >
                      {storesInfoRecord[order.storeId ?? ""]?.name}
                    </Text>
                  </View>

                  {/* services */}
                  {servicesInfoRecord[order.storeId ?? ""]?.map(
                    (service, index) => (
                      <View key={index}>
                        <View style={[styles.orderServiceContainer]}>
                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.name}
                          </Text>

                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.duration} min
                          </Text>

                          {service.discount && service.discount > 0 ? (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp
                              {priceFormat(
                                ((100 - service.discount) * service.price) / 100
                              )}{" "}
                              ({service.discount}% off)
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp{priceFormat(service.price)}
                            </Text>
                          )}
                        </View>

                        {serviceProductsInfoRecord[order.storeId ?? ""] &&
                          serviceProductsInfoRecord[order.storeId ?? ""]
                            .length > 0 && (
                            <View
                              style={{
                                flex: 1,
                                padding: 0.5,
                                backgroundColor: activeColors.tertiary,
                                marginLeft: 30,
                                marginVertical: 1,
                              }}
                            />
                          )}

                        {/* servicesProducts */}
                        <View>
                          {serviceProductsInfoRecord[order.storeId ?? ""]
                            ?.filter((obj) => obj.serviceId === service.id)
                            ?.map((serviceProduct, index) => (
                              <View
                                key={index}
                                style={[styles.orderServiceProductContainer]}
                              >
                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  {serviceProduct.name}
                                </Text>

                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  Rp
                                  {priceFormat(serviceProduct.additionalPrice)}
                                </Text>
                              </View>
                            ))}
                        </View>

                        <View
                          style={{
                            flex: 1,
                            padding: 0.5,
                            backgroundColor: activeColors.tertiary,
                          }}
                        />
                      </View>
                    )
                  )}

                  {/* Estimate Time &Total price */}
                  <View style={styles.orderEstimateNTotalContainer}>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Estimated Time:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          {order.totalDuration} min
                        </Text>
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Total:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          Rp{priceFormat(order.totalPrice)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* date */}
                  <View style={styles.dateTimePickerContainer}>
                    <>
                      {order.date && (
                        <View style={{ width: "100%", marginBottom: 10 }}>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Date & Time
                          </Text>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {order.date.toUTCString().includes("GMT")
                              ? new Date(
                                  order.date.getTime() + 7 * 60 * 60 * 1000
                                )
                                  .toUTCString()
                                  .split("GMT")[0]
                              : new Date(
                                  new Date(
                                    order.date.getTime() + 7 * 60 * 60 * 1000
                                  ).getTime()
                                )
                                  .toUTCString()
                                  .split("GMT")[0]}
                          </Text>
                        </View>
                      )}

                      <DateTimePickerComponent
                        onPress={(value: Date) => {
                          order.date = value;
                          setOrders([...orders]);
                        }}
                        isDisabled={
                          WaitingForConfirmationOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          ) ||
                          WaitingForPaymentOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          )
                        }
                      />
                    </>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* workers */}
                  {storesInfoRecord[order.storeId ?? ""]?.canChooseWorker &&
                    workersInfoRecord[order.storeId ?? ""]?.workers &&
                    workersInfoRecord[order.storeId ?? ""]?.workers.length >
                      0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          zIndex: 99,
                        }}
                      >
                        <View style={{ marginRight: 10 }}>
                          <Text style={{ color: activeColors.accent }}>
                            Worker:
                          </Text>
                        </View>
                        <View style={styles.workerInputContainer}>
                          <DropdownPicker
                            key="workerIdsOrder"
                            options={workersInfoRecord[
                              order.storeId ?? ""
                            ]?.workers.map((worker) => ({
                              label: worker.firstName + " " + worker.lastName,
                              value: worker.id || "",
                            }))}
                            selectedValue={order.workerId ?? ""}
                            onValueChange={(workerId: string) => {
                              order.workerId = workerId;
                              setOrders([...orders]);
                            }}
                            placeHolder="Select Worker (Optional)"
                            isInput={false}
                            context="Worker"
                          />
                        </View>
                      </View>
                    )}

                  {storesInfoRecord[order.storeId ?? ""]?.canChooseWorker &&
                    order.workerId && (
                      <View
                        style={[
                          styles.workerContainer,
                          { borderColor: activeColors.tertiary },
                        ]}
                      >
                        {(() => {
                          const selectedWorker = workersInfoRecord[
                            order.storeId ?? ""
                          ]?.workers.find(
                            (worker) => worker.id === order.workerId
                          );

                          if (!selectedWorker) return null;
                          return (
                            <>
                              <View style={styles.workerInfoContainer}>
                                <Image
                                  source={{ uri: selectedWorker?.image }}
                                  style={styles.imageWorker}
                                />
                                <Text style={{ color: activeColors.accent }}>
                                  {selectedWorker?.firstName}{" "}
                                  {selectedWorker?.lastName}
                                </Text>
                              </View>
                              <Text style={{ color: activeColors.accent }}>
                                {selectedWorker?.isOnDuty
                                  ? "On Duty"
                                  : "Off Duty"}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    )}

                  {/* notes */}
                  <View style={styles.orderNotesContainer}>
                    <Text
                      style={[
                        {
                          color: activeColors.infoColor,
                          fontWeight: "bold",
                          fontSize: 16,
                        },
                      ]}
                    >
                      NOTES:{" "}
                      {storesInfoRecord[order.storeId ?? ""]?.toleranceTime}{" "}
                      minutes tolarance late
                    </Text>
                  </View>

                  {/* Address */}
                  <View
                    style={[
                      styles.addressContainer,
                      {
                        borderColor: activeColors.secondary,
                        backgroundColor: activeColors.secondary,
                      },
                    ]}
                  >
                    <View
                      style={{
                        marginRight: 10,
                        paddingVertical: 10,
                        height: "100%",
                      }}
                    >
                      <Entypo
                        name="location"
                        size={30}
                        color={activeColors.accent}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order.storeId ?? ""]?.district},{" "}
                        {storesInfoRecord[order.storeId ?? ""]?.subDistrict}
                      </Text>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order.storeId ?? ""]?.location}
                      </Text>
                    </View>

                    <Pressable
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onPress={() =>
                        handleCopy(
                          storesInfoRecord[order.storeId ?? ""]?.location,
                          "Location"
                        )
                      }
                    >
                      <Feather
                        name="copy"
                        size={24}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* Create Order Button */}
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Create Order",
                        "Are you sure to create this order?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "OK",
                            onPress: () =>
                              handleCreateOrder(order.storeId ?? ""),
                          },
                        ]
                      )
                    }
                    style={[
                      styles.createOrderButton,
                      {
                        backgroundColor:
                          !order.date ||
                          WaitingForConfirmationOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          ) ||
                          WaitingForPaymentOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          )
                            ? activeColors.disabledColor
                            : activeColors.accent,
                      },
                    ]}
                    disabled={
                      !order.date ||
                      WaitingForConfirmationOrders.orders.some(
                        (order) => order.storeId === order.storeId
                      ) ||
                      WaitingForPaymentOrders.orders.some(
                        (order) => order.storeId === order.storeId
                      )
                        ? true
                        : false
                    }
                  >
                    <Text
                      style={{
                        color:
                          !order.date ||
                          WaitingForConfirmationOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          ) ||
                          WaitingForPaymentOrders.orders.some(
                            (order) => order.storeId === order.storeId
                          )
                            ? activeColors.accent
                            : activeColors.primary,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Create Order
                    </Text>
                  </Pressable>

                  {/* open close */}
                  <View style={{ position: "absolute", top: 5, right: 10 }}>
                    {storesInfoRecord[order.storeId ?? ""]?.isOpen ? (
                      <Image
                        source={require("../../assets/open.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/closed.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {step === 2 && (
        <>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: activeColors.tertiary,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: activeColors.accent,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Confirmation stage notes
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Order will be auto rejected if store does not response for 5
              minutes
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Go to order history in your settings to see detail rejection of
              your order
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginHorizontal: 20 }}
            nestedScrollEnabled={true}
          >
            <View style={{ paddingBottom: 80 }}>
              {WaitingForConfirmationOrders?.orders.map((order) => (
                <View
                  key={order._id}
                  style={[
                    styles.orderContainer,
                    { borderColor: activeColors.tertiary },
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
                            : order.status === "Paid"
                            ? "#98FB98"
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
                      {order.status}
                    </Text>
                  </View>

                  {/* Countdown Timer */}
                  <CountdownTimer
                    id={order._id ?? ""}
                    initialMinutes={5}
                    onTimerEnd={() => {
                      handleGetOrdersByStatus("Waiting for Confirmation");
                      Alert.alert(
                        "Order rejected",
                        `Order ${order._id} has been rejected, check order history for details.`
                      );
                    }}
                  />

                  {/* order id */}
                  <View
                    style={{
                      backgroundColor: activeColors.secondary,
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      borderRadius: 5,
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: activeColors.accent,
                        fontSize: 15,
                        width: "90%",
                      }}
                    >
                      Order Id:
                      <Text style={{ fontWeight: "bold" }}> {order._id}</Text>
                    </Text>

                    {/* Delete Icon */}
                    <Pressable
                      style={{ marginLeft: 10 }}
                      onPress={() =>
                        Alert.alert(
                          "Are you sure want to cancel this order?",
                          "Choose an option",
                          [
                            {
                              text: "Yes",
                              onPress: () => handleCancelOrder(order._id ?? ""),
                            },
                            { text: "Cancel", style: "cancel" },
                          ]
                        )
                      }
                    >
                      <AntDesign
                        name="delete"
                        size={20}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* store name */}
                  <View
                    style={[
                      styles.orderStoreName,
                      { borderColor: activeColors.tertiary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStoreNameText,
                        {
                          color: activeColors.accent,
                        },
                      ]}
                    >
                      {storesInfoRecord[order._id ?? ""]?.name}
                    </Text>
                  </View>

                  {/* services */}
                  {servicesInfoRecord[order._id ?? ""]?.map(
                    (service, index) => (
                      <View key={index}>
                        <View style={[styles.orderServiceContainer]}>
                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.name}
                          </Text>

                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.duration} min
                          </Text>

                          {service.discount && service.discount > 0 ? (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp
                              {priceFormat(
                                ((100 - service.discount) * service.price) / 100
                              )}{" "}
                              ({service.discount}% off)
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp{priceFormat(service.price)}
                            </Text>
                          )}
                        </View>

                        {serviceProductsInfoRecord[order._id ?? ""] &&
                          serviceProductsInfoRecord[order._id ?? ""].length >
                            0 && (
                            <View
                              style={{
                                flex: 1,
                                padding: 0.5,
                                backgroundColor: activeColors.tertiary,
                                marginLeft: 30,
                                marginVertical: 1,
                              }}
                            />
                          )}

                        {/* servicesProducts */}
                        <View>
                          {serviceProductsInfoRecord[order._id ?? ""]
                            ?.filter((obj) => obj.serviceId === service.id)
                            ?.map((serviceProduct, index) => (
                              <View
                                key={index}
                                style={[styles.orderServiceProductContainer]}
                              >
                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  {serviceProduct.name}
                                </Text>

                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  Rp
                                  {priceFormat(serviceProduct.additionalPrice)}
                                </Text>
                              </View>
                            ))}
                        </View>

                        <View
                          style={{
                            flex: 1,
                            padding: 0.5,
                            backgroundColor: activeColors.tertiary,
                          }}
                        />
                      </View>
                    )
                  )}

                  {/* Estimate Time &Total price */}
                  <View style={styles.orderEstimateNTotalContainer}>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Estimated Time:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          {order.totalDuration} min
                        </Text>
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Total:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          Rp{priceFormat(order.totalPrice)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* date */}
                  <View style={styles.dateTimePickerContainer}>
                    <>
                      {order.date && (
                        <View style={{ width: "100%" }}>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Date & Time
                          </Text>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {new Date(order.date).toUTCString().split("GMT")[0]}
                          </Text>
                        </View>
                      )}
                    </>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* workers */}
                  {storesInfoRecord[order._id ?? ""]?.canChooseWorker &&
                    order.workerId && (
                      <View
                        style={[
                          styles.workerContainer,
                          { borderColor: activeColors.tertiary },
                        ]}
                      >
                        {(() => {
                          const selectedWorker = workersInfoRecord[
                            order._id ?? ""
                          ]?.workers.find(
                            (worker) => worker.id === order.workerId
                          );

                          if (!selectedWorker) return null;
                          return (
                            <>
                              <View style={styles.workerInfoContainer}>
                                <Image
                                  source={{ uri: selectedWorker?.image }}
                                  style={styles.imageWorker}
                                />
                                <Text style={{ color: activeColors.accent }}>
                                  {selectedWorker?.firstName}{" "}
                                  {selectedWorker?.lastName}
                                </Text>
                              </View>
                              <Text style={{ color: activeColors.accent }}>
                                {selectedWorker?.isOnDuty
                                  ? "On Duty"
                                  : "Off Duty"}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    )}

                  {/* notes */}
                  <View style={styles.orderNotesContainer}>
                    <Text
                      style={[
                        {
                          color: activeColors.infoColor,
                          fontWeight: "bold",
                          fontSize: 16,
                        },
                      ]}
                    >
                      NOTES: {storesInfoRecord[order._id ?? ""]?.toleranceTime}{" "}
                      minutes tolarance late
                    </Text>
                  </View>

                  {/* Address */}
                  <View
                    style={[
                      styles.addressContainer,
                      {
                        borderColor: activeColors.secondary,
                        backgroundColor: activeColors.secondary,
                      },
                    ]}
                  >
                    <View
                      style={{
                        marginRight: 10,
                        paddingVertical: 10,
                        height: "100%",
                      }}
                    >
                      <Entypo
                        name="location"
                        size={30}
                        color={activeColors.accent}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.district},{" "}
                        {storesInfoRecord[order._id ?? ""]?.subDistrict}
                      </Text>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.location}
                      </Text>
                    </View>

                    <Pressable
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onPress={() =>
                        handleCopy(
                          storesInfoRecord[order._id ?? ""]?.location,
                          "Location"
                        )
                      }
                    >
                      <Feather
                        name="copy"
                        size={24}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* open close */}
                  <View style={{ position: "absolute", top: 185, right: 10 }}>
                    {storesInfoRecord[order._id ?? ""]?.isOpen ? (
                      <Image
                        source={require("../../assets/open.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/closed.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {step === 3 && (
        <>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: activeColors.tertiary,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: activeColors.accent,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Payment stage notes
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Once the order is paid, you cannot cancel it no matter what.
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Order will be auto rejected if customer does not pay in 5
              minutes
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Go to order history in your settings to see detail rejection of
              your order
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginHorizontal: 20 }}
            nestedScrollEnabled={true}
          >
            <View style={{ paddingBottom: 80 }}>
              {WaitingForPaymentOrders?.orders.map((order) => (
                <View
                  key={order._id}
                  style={[
                    styles.orderContainer,
                    { borderColor: activeColors.tertiary },
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
                            : order.status === "Paid"
                            ? "#98FB98"
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
                      {order.status}
                    </Text>
                  </View>

                  {/* Countdown Timer */}
                  <CountdownTimer
                    id={order._id ?? ""}
                    initialMinutes={5}
                    onTimerEnd={() => {
                      handleGetOrdersByStatus("Waiting for Payment");
                      Alert.alert(
                        "Payment time out",
                        `Order ${order._id} has been rejected, check order history for details.`
                      );
                    }}
                  />

                  {/* Virtual BCA */}
                  <View
                    style={{
                      borderColor: activeColors.tertiary,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 15,
                      marginVertical: 10,
                      paddingHorizontal: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: activeColors.accent,
                        textAlign: "center",
                        fontSize: 18,
                      }}
                    >
                      Virtual BCA Number {"\n"}
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: activeColors.infoColor,
                        }}
                      >
                        733{user.phone}
                      </Text>
                    </Text>

                    <Pressable
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onPress={() =>
                        handleCopy("733" + user.phone, "Virtual BCA Number")
                      }
                    >
                      <Feather
                        name="copy"
                        size={24}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* order id */}
                  <View
                    style={{
                      backgroundColor: activeColors.secondary,
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      borderRadius: 5,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: activeColors.accent,
                        fontSize: 15,
                        width: "90%",
                      }}
                    >
                      Order Id:
                      <Text style={{ fontWeight: "bold" }}> {order._id}</Text>
                    </Text>

                    {/* Delete Icon */}
                    <Pressable
                      style={{ marginLeft: 10 }}
                      onPress={() =>
                        Alert.alert(
                          "Are you sure want to cancel this order?",
                          "Choose an option",
                          [
                            {
                              text: "Yes",
                              onPress: () => handleCancelOrder(order._id ?? ""),
                            },
                            { text: "Cancel", style: "cancel" },
                          ]
                        )
                      }
                    >
                      <AntDesign
                        name="delete"
                        size={20}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* store name */}
                  <View
                    style={[
                      styles.orderStoreName,
                      { borderColor: activeColors.tertiary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStoreNameText,
                        {
                          color: activeColors.accent,
                        },
                      ]}
                    >
                      {storesInfoRecord[order._id ?? ""]?.name}
                    </Text>
                  </View>

                  {/* services */}
                  {servicesInfoRecord[order._id ?? ""]?.map(
                    (service, index) => (
                      <View key={index}>
                        <View style={[styles.orderServiceContainer]}>
                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.name}
                          </Text>

                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.duration} min
                          </Text>

                          {service.discount && service.discount > 0 ? (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp
                              {priceFormat(
                                ((100 - service.discount) * service.price) / 100
                              )}{" "}
                              ({service.discount}% off)
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp{priceFormat(service.price)}
                            </Text>
                          )}
                        </View>

                        {serviceProductsInfoRecord[order._id ?? ""] &&
                          serviceProductsInfoRecord[order._id ?? ""].length >
                            0 && (
                            <View
                              style={{
                                flex: 1,
                                padding: 0.5,
                                backgroundColor: activeColors.tertiary,
                                marginLeft: 30,
                                marginVertical: 1,
                              }}
                            />
                          )}

                        {/* servicesProducts */}
                        <View>
                          {serviceProductsInfoRecord[order._id ?? ""]
                            ?.filter((obj) => obj.serviceId === service.id)
                            ?.map((serviceProduct, index) => (
                              <View
                                key={index}
                                style={[styles.orderServiceProductContainer]}
                              >
                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  {serviceProduct.name}
                                </Text>

                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  Rp
                                  {priceFormat(serviceProduct.additionalPrice)}
                                </Text>
                              </View>
                            ))}
                        </View>

                        <View
                          style={{
                            flex: 1,
                            padding: 0.5,
                            backgroundColor: activeColors.tertiary,
                          }}
                        />
                      </View>
                    )
                  )}

                  {/* Estimate Time &Total price */}
                  <View style={styles.orderEstimateNTotalContainer}>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Estimated Time:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          {order.totalDuration} min
                        </Text>
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Total:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          Rp{priceFormat(order.totalPrice)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* date */}
                  <View style={styles.dateTimePickerContainer}>
                    <>
                      {order.date && (
                        <View style={{ width: "100%" }}>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Date & Time
                          </Text>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {new Date(order.date).toUTCString().split("GMT")[0]}
                          </Text>
                        </View>
                      )}
                    </>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* workers */}
                  {storesInfoRecord[order._id ?? ""]?.canChooseWorker &&
                    order.workerId && (
                      <View
                        style={[
                          styles.workerContainer,
                          { borderColor: activeColors.tertiary },
                        ]}
                      >
                        {(() => {
                          const selectedWorker = workersInfoRecord[
                            order._id ?? ""
                          ]?.workers.find(
                            (worker) => worker.id === order.workerId
                          );

                          if (!selectedWorker) return null;
                          return (
                            <>
                              <View style={styles.workerInfoContainer}>
                                <Image
                                  source={{ uri: selectedWorker?.image }}
                                  style={styles.imageWorker}
                                />
                                <Text style={{ color: activeColors.accent }}>
                                  {selectedWorker?.firstName}{" "}
                                  {selectedWorker?.lastName}
                                </Text>
                              </View>
                              <Text style={{ color: activeColors.accent }}>
                                {selectedWorker?.isOnDuty
                                  ? "On Duty"
                                  : "Off Duty"}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    )}

                  {/* notes */}
                  <View style={styles.orderNotesContainer}>
                    <Text
                      style={[
                        {
                          color: activeColors.infoColor,
                          fontWeight: "bold",
                          fontSize: 16,
                        },
                      ]}
                    >
                      NOTES: {storesInfoRecord[order._id ?? ""]?.toleranceTime}{" "}
                      minutes tolarance late
                    </Text>
                  </View>

                  {/* Address */}
                  <View
                    style={[
                      styles.addressContainer,
                      {
                        borderColor: activeColors.secondary,
                        backgroundColor: activeColors.secondary,
                      },
                    ]}
                  >
                    <View
                      style={{
                        marginRight: 10,
                        paddingVertical: 10,
                        height: "100%",
                      }}
                    >
                      <Entypo
                        name="location"
                        size={30}
                        color={activeColors.accent}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.district},{" "}
                        {storesInfoRecord[order._id ?? ""]?.subDistrict}
                      </Text>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.location}
                      </Text>
                    </View>

                    <Pressable
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onPress={() =>
                        handleCopy(
                          storesInfoRecord[order._id ?? ""]?.location,
                          "Location"
                        )
                      }
                    >
                      <Feather
                        name="copy"
                        size={24}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* open close */}
                  <View style={{ position: "absolute", top: 275, right: 10 }}>
                    {storesInfoRecord[order._id ?? ""]?.isOpen ? (
                      <Image
                        source={require("../../assets/open.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/closed.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {step === 4 && (
        <>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: activeColors.tertiary,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: activeColors.accent,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              On Going stage notes (last stage)
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - Remember not to past the store tolarance time (better be on
              time)
            </Text>
            <Text style={{ color: activeColors.infoColor, fontSize: 15 }}>
              - To check past order go to order history in your settings.
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginHorizontal: 20 }}
            nestedScrollEnabled={true}
          >
            <View style={{ paddingBottom: 80 }}>
              {onGoingOrders?.orders.map((order) => (
                <View
                  key={order._id}
                  style={[
                    styles.orderContainer,
                    { borderColor: activeColors.tertiary },
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
                            : order.status === "Paid"
                            ? "#98FB98"
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
                      {order.status}
                    </Text>
                  </View>

                  {/* order id */}
                  <View
                    style={{
                      backgroundColor: activeColors.secondary,
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      borderRadius: 5,
                      marginRight: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: activeColors.accent,
                        fontSize: 15,
                      }}
                    >
                      Order Id:
                      <Text style={{ fontWeight: "bold" }}> {order._id}</Text>
                    </Text>
                  </View>

                  {/* store name */}
                  <View
                    style={[
                      styles.orderStoreName,
                      { borderColor: activeColors.tertiary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStoreNameText,
                        {
                          color: activeColors.accent,
                        },
                      ]}
                    >
                      {storesInfoRecord[order._id ?? ""]?.name}
                    </Text>
                  </View>

                  {/* services */}
                  {servicesInfoRecord[order._id ?? ""]?.map(
                    (service, index) => (
                      <View key={index}>
                        <View style={[styles.orderServiceContainer]}>
                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.name}
                          </Text>

                          <Text
                            style={[
                              styles.orderServiceText,
                              {
                                color: activeColors.accent,
                              },
                            ]}
                          >
                            {service.duration} min
                          </Text>

                          {service.discount && service.discount > 0 ? (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp
                              {priceFormat(
                                ((100 - service.discount) * service.price) / 100
                              )}{" "}
                              ({service.discount}% off)
                            </Text>
                          ) : (
                            <Text
                              style={[
                                styles.orderServiceText,
                                {
                                  color: activeColors.accent,
                                },
                              ]}
                            >
                              Rp{priceFormat(service.price)}
                            </Text>
                          )}
                        </View>

                        {serviceProductsInfoRecord[order._id ?? ""] &&
                          serviceProductsInfoRecord[order._id ?? ""].length >
                            0 && (
                            <View
                              style={{
                                flex: 1,
                                padding: 0.5,
                                backgroundColor: activeColors.tertiary,
                                marginLeft: 30,
                                marginVertical: 1,
                              }}
                            />
                          )}

                        {/* servicesProducts */}
                        <View>
                          {serviceProductsInfoRecord[order._id ?? ""]
                            ?.filter((obj) => obj.serviceId === service.id)
                            ?.map((serviceProduct, index) => (
                              <View
                                key={index}
                                style={[styles.orderServiceProductContainer]}
                              >
                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  {serviceProduct.name}
                                </Text>

                                <Text
                                  style={[
                                    styles.orderServiceProductText,
                                    {
                                      color: activeColors.accent,
                                    },
                                  ]}
                                >
                                  Rp
                                  {priceFormat(serviceProduct.additionalPrice)}
                                </Text>
                              </View>
                            ))}
                        </View>

                        <View
                          style={{
                            flex: 1,
                            padding: 0.5,
                            backgroundColor: activeColors.tertiary,
                          }}
                        />
                      </View>
                    )
                  )}

                  {/* Estimate Time &Total price */}
                  <View style={styles.orderEstimateNTotalContainer}>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Estimated Time:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          {order.totalDuration} min
                        </Text>
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.orderEstimateNTotalText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Total:{" "}
                        <Text style={{ color: activeColors.infoColor }}>
                          Rp{priceFormat(order.totalPrice)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* date */}
                  <View style={styles.dateTimePickerContainer}>
                    <>
                      {order.date && (
                        <View style={{ width: "100%" }}>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Date & Time
                          </Text>
                          <Text
                            style={[
                              styles.dateTimeText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {new Date(order.date).toUTCString().split("GMT")[0]}
                          </Text>
                        </View>
                      )}
                    </>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 0.5,
                      backgroundColor: activeColors.tertiary,
                    }}
                  />

                  {/* workers */}
                  {storesInfoRecord[order._id ?? ""]?.canChooseWorker &&
                    order.workerId && (
                      <View
                        style={[
                          styles.workerContainer,
                          { borderColor: activeColors.tertiary },
                        ]}
                      >
                        {(() => {
                          const selectedWorker = workersInfoRecord[
                            order._id ?? ""
                          ]?.workers.find(
                            (worker) => worker.id === order.workerId
                          );

                          if (!selectedWorker) return null;
                          return (
                            <>
                              <View style={styles.workerInfoContainer}>
                                <Image
                                  source={{ uri: selectedWorker?.image }}
                                  style={styles.imageWorker}
                                />
                                <Text style={{ color: activeColors.accent }}>
                                  {selectedWorker?.firstName}{" "}
                                  {selectedWorker?.lastName}
                                </Text>
                              </View>
                              <Text style={{ color: activeColors.accent }}>
                                {selectedWorker?.isOnDuty
                                  ? "On Duty"
                                  : "Off Duty"}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    )}

                  {/* notes */}
                  <View style={styles.orderNotesContainer}>
                    <Text
                      style={[
                        {
                          color: activeColors.infoColor,
                          fontWeight: "bold",
                          fontSize: 16,
                        },
                      ]}
                    >
                      NOTES: {storesInfoRecord[order._id ?? ""]?.toleranceTime}{" "}
                      minutes tolarance late
                    </Text>
                  </View>

                  {/* Address */}
                  <View
                    style={[
                      styles.addressContainer,
                      {
                        borderColor: activeColors.secondary,
                        backgroundColor: activeColors.secondary,
                      },
                    ]}
                  >
                    <View
                      style={{
                        marginRight: 10,
                        paddingVertical: 10,
                        height: "100%",
                      }}
                    >
                      <Entypo
                        name="location"
                        size={30}
                        color={activeColors.accent}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.district},{" "}
                        {storesInfoRecord[order._id ?? ""]?.subDistrict}
                      </Text>
                      <Text
                        style={[
                          styles.addressText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {storesInfoRecord[order._id ?? ""]?.location}
                      </Text>
                    </View>

                    <Pressable
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onPress={() =>
                        handleCopy(
                          storesInfoRecord[order._id ?? ""]?.location,
                          "Location"
                        )
                      }
                    >
                      <Feather
                        name="copy"
                        size={24}
                        color={activeColors.accent}
                      />
                    </Pressable>
                  </View>

                  {/* open close */}
                  <View style={{ position: "absolute", top: 115, right: 10 }}>
                    {storesInfoRecord[order._id ?? ""]?.isOpen ? (
                      <Image
                        source={require("../../assets/open.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/closed.png")}
                        style={{ width: 45, height: 45 }}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
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

  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    // height: 50,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  tabsItem: {
    flex: 1,
    alignItems: "center",
    // backgroundColor: "black",
  },
  tabsItemNumber: {
    width: 25,
    height: 25,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsItemText: {
    fontSize: 12,
  },

  orderContainer: {
    flexDirection: "column",
    marginHorizontal: 15,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderStoreName: {
    marginBottom: 5,
    borderBottomWidth: 1,
    paddingVertical: 7,
    width: "85%",
  },
  orderStoreNameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  orderServiceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  orderServiceText: {
    fontSize: 14,
    fontWeight: "400",
  },
  orderServiceProductContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 30,
    marginVertical: 2,
  },
  orderServiceProductText: {
    fontSize: 14,
    fontWeight: "400",
  },
  orderEstimateNTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    alignItems: "center",
  },
  orderEstimateNTotalText: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 14,
  },
  dateTimePickerContainer: {
    width: (screenWidth * 2) / 3 + 50,
    paddingHorizontal: 20,
    marginTop: 10,
    paddingBottom: 10,
  },
  dateTimeText: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  workerInputContainer: {
    width: "80%",
    zIndex: 99,
  },
  workerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  workerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWorker: {
    width: 50,
    height: 50,
    resizeMode: "cover",
    borderRadius: 50,
    marginRight: 10,
  },
  orderNotesContainer: {
    flex: 1,
    marginTop: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 5,
    width: "90%",
  },
  createOrderButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
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
});
