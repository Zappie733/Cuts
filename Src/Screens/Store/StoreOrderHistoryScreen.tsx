import React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { colors } from "../../Config/Theme";
import { Store } from "../../Contexts/StoreContext";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  ScrollView,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { set } from "mongoose";
import { GetStoreOrderHistoryResponse } from "../../Types/ResponseTypes/OrderResponse";
import { getStoreOrderHistory } from "../../Middlewares/OrderMiddleware";
import { apiCallHandler } from "../../Middlewares/util";
import { GetUserInfoForOrderByIdResponse } from "../../Types/ResponseTypes";
import { getUserInfoForOrderById } from "../../Middlewares/UserMiddleware";
import { AntDesign } from "@expo/vector-icons";
import { ServiceObj } from "../../Types/StoreTypes/ServiceTypes";
import { ServiceProductObj } from "../../Types/StoreTypes/ServiceProductTypes";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;
const PAGE_LIMIT = 3;

export const StoreOrderHistoryScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreOrderHistory">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear + 1 - new Date(store.approvedDate).getFullYear() }, // +1 so atleast it has the same year as currentYear
    (_, index) => currentYear - index //index start from
  );
  const [year, setYear] = useState(years[0].toString());
  const yearsOptions = years.map((year) => ({
    label: year.toString(),
    value: year.toString(),
  }));

  const currentMonth = new Date().getMonth() + 1; //getMonth starts from 0 and end in 11
  const [month, setMonth] = useState(currentMonth.toString());
  const monthslable = [
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
  const monthsOptions = Array.from({ length: 12 }, (_, index) => index + 1).map(
    (month) => ({ label: monthslable[month - 1], value: month.toString() })
  );

  // console.log("month", month);
  // console.log("year", year);

  const [data, setData] = useState<GetStoreOrderHistoryResponse>();
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const handleFetchOrderSummary = async () => {
    if (loading || !hasMore) {
      // console.log("loading", loading);
      // console.log("has more", hasMore);
      console.log("loading or no more data");
      return;
    }

    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getStoreOrderHistory({
          auth,
          updateAccessToken,
          params: {
            storeId: store._id,
            limit: PAGE_LIMIT,
            offset: offset,
            month: month,
            year: year,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      const currentTotal = data?.orders.length ?? 0 + PAGE_LIMIT;
      console.log("current total", currentTotal);
      console.log("ada", response.data);

      setData((prevData) => ({
        orders: [...(prevData?.orders || []), ...(response.data?.orders || [])],
        total: response.data?.total || prevData?.total || 0,
        summary: response.data?.summary || prevData?.summary,
      }));

      setHasMore(response.data.total > currentTotal);
      setOffset((prevOffset) => prevOffset + PAGE_LIMIT);
    } else if (response) {
      console.log(response.status, response.message);
      setHasMore(false); // Stop fetching on error
    }

    setLoading(false);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={{ margin: 10 }} />;
  };

  const [userInfoRecord, setUserInfoRecord] = useState<
    Record<string, GetUserInfoForOrderByIdResponse>
  >({});

  const fetchUserInfoForOrderById = async (userId: string) => {
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
  };

  const getUserInfoRecord = async () => {
    const userInfoRecordTemp: Record<string, GetUserInfoForOrderByIdResponse> =
      {};

    const promises = data?.orders.map(async (order) => {
      if (order.isManual) return;
      const userInfo = await fetchUserInfoForOrderById(order.userId ?? "");
      userInfoRecordTemp[order.userId ?? ""] = userInfo;
    });

    await Promise.all(promises ?? []);
    setUserInfoRecord(userInfoRecordTemp);
  };

  const [viewOrderDetail, setViewOrderDetail] =
    useState<Map<string, boolean>>();
  const toggleOrderDetail = (orderId: string) => {
    setViewOrderDetail((prev) => {
      const newMap = new Map(prev);
      newMap.set(orderId, !newMap.get(orderId)); // Toggle visibility
      return newMap;
    });
  };

  const [servicesRecord, setServicesRecord] = useState<
    Record<string, ServiceObj>
  >({});

  const getStoreServices = () => {
    const servicesRecordTemp: Record<string, ServiceObj> = {};

    store.services.forEach((service) => {
      servicesRecordTemp[service._id ?? ""] = service;
    });
    setServicesRecord(servicesRecordTemp);
  };

  const [serviceProductsRecord, setServiceProductsRecord] = useState<
    Record<string, ServiceProductObj>
  >({});

  const getStoreServiceProducts = () => {
    const serviceProductsRecordTemp: Record<string, ServiceProductObj> = {};

    store.serviceProducts.forEach((serviceProduct) => {
      serviceProductsRecordTemp[serviceProduct._id ?? ""] = serviceProduct;
    });
    setServiceProductsRecord(serviceProductsRecordTemp);
  };

  useEffect(() => {
    if (store._id) {
      getStoreServices();
      getStoreServiceProducts();
    }
  }, [store]);

  useEffect(() => {
    if (offset === 0) {
      console.log("NEW FETCH");
      handleFetchOrderSummary();
    }
    // console.log("offset", offset);
  }, [offset]);

  const isFirstRender = useRef(true);
  // set withfilter or not
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setData(undefined);
    setHasMore(true);
    setOffset(0);
  }, [month, year]);

  useEffect(() => {
    if (data) {
      getUserInfoRecord();
    }
  }, [data]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      {/* title */}
      <Text style={[styles.title, { color: activeColors.accent }]}>
        Order History
      </Text>

      {/* filter */}
      <View style={styles.filterContainer}>
        <View style={{ flex: 2 }}>
          <DropdownPicker
            key="month"
            options={monthsOptions}
            selectedValue={month}
            onValueChange={setMonth}
            placeHolder="Month..."
            isInput={false}
          />
        </View>

        <View style={{ flex: 1 }}>
          <DropdownPicker
            key="year"
            options={yearsOptions}
            selectedValue={year}
            onValueChange={setYear}
            placeHolder="Year..."
            isInput={false}
          />
        </View>
      </View>

      {/* Summary */}
      <View>
        <Text style={[styles.titleSummary, { color: activeColors.accent }]}>
          Summary for {monthslable[Number(month) - 1]} {year}
        </Text>

        <View
          style={[
            styles.summaryContainer,
            { backgroundColor: activeColors.secondary },
          ]}
        >
          {data?.summary && data.summary.length > 0 ? (
            data.summary.map((summary, index) => (
              <View key={index}>
                <Text
                  style={[styles.summaryText, { color: activeColors.accent }]}
                >
                  {summary.serviceName.replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
                  : {summary.total}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.summaryText, { color: activeColors.accent }]}>
              No data available
            </Text>
          )}
        </View>
      </View>

      {/* Orders */}
      {data?.total !== 0 && (
        <View
          style={[
            styles.orderContainer,
            { backgroundColor: activeColors.secondary },
          ]}
        >
          <FlatList
            data={data?.orders || null}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: activeColors.primary,
                    borderColor: activeColors.tertiary,
                  },
                ]}
              >
                {/* date */}
                <View style={styles.dateContainer}>
                  <Text
                    style={[styles.dateText, { color: activeColors.accent }]}
                  >
                    {new Date(item.date).toUTCString().slice(0, 16)}
                  </Text>
                </View>

                {/* status */}
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor:
                        item.status === "Waiting for Confirmation"
                          ? "#FFDD57"
                          : item.status === "Waiting for Payment"
                          ? "#FFA07A"
                          : item.status === "Rejected"
                          ? "#FF6F61"
                          : item.status === "Paid"
                          ? "#98FB98"
                          : item.status === "Completed"
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
                    {item.status === undefined ? "Manual" : item.status}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  {/* duration */}
                  <View style={styles.durationContainer}>
                    <Text
                      style={[
                        styles.durationText,
                        { color: activeColors.accent },
                      ]}
                    >
                      {new Date(item.date).toUTCString().split(" ")[4]} -{" "}
                      {new Date(item.endTime).toUTCString().split(" ")[4]}{" "}
                    </Text>
                    {item.timeDifference && (
                      <Text
                        style={[
                          styles.timeDifferenceText,
                          { color: activeColors.infoColor },
                        ]}
                      >
                        {item.timeDifference && item.timeDifference > 0
                          ? `${item.timeDifference} minutes slower than expected`
                          : item.timeDifference && item.timeDifference < 0
                          ? `${Math.abs(
                              item.timeDifference
                            )} minutes faster than expected`
                          : ""}
                      </Text>
                    )}
                  </View>

                  {/* User Info */}
                  <View style={styles.userInfoContainer}>
                    {item.userName ? (
                      <Text
                        style={[
                          styles.userInfoText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {item.userName}
                      </Text>
                    ) : (
                      <View>
                        <Text
                          style={[
                            styles.userInfoText,
                            { color: activeColors.accent },
                          ]}
                        >
                          {userInfoRecord[item.userId ?? ""]
                            ? userInfoRecord[item.userId ?? ""]?.firstName +
                              " " +
                              userInfoRecord[item.userId ?? ""]?.lastName
                            : ""}
                        </Text>
                        <Text
                          style={[
                            styles.userInfoText,
                            { color: activeColors.accent },
                          ]}
                        >
                          {userInfoRecord[item.userId ?? ""]?.phone}
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
                      onPress={() => toggleOrderDetail(item._id ?? "")}
                    >
                      <Text style={{ color: activeColors.secondary }}>
                        {viewOrderDetail?.get(item._id ?? "") ? (
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

                  {viewOrderDetail?.get(item._id ?? "") && (
                    <>
                      {/* services & service products */}
                      <View>
                        {item.serviceIds.map((serviceId, index) => (
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
                                {servicesRecord[serviceId].name}
                              </Text>
                              <Text
                                style={{
                                  color: activeColors.accent,
                                }}
                              >
                                {servicesRecord[serviceId].duration} min
                              </Text>
                              <Text
                                style={{
                                  color: activeColors.accent,
                                }}
                              >
                                Rp.{servicesRecord[serviceId].price}
                              </Text>
                            </View>

                            {/* service products line */}
                            {servicesRecord[serviceId]?.serviceProduct &&
                              servicesRecord[serviceId]?.serviceProduct.length >
                                0 && (
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
                                    item.chosenServiceProductsIds
                                      ?.find(
                                        (id) =>
                                          id.serviceId.toString() ===
                                          serviceId.toString()
                                      )
                                      ?.serviceProductIds.includes(productId) ||
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
                                      {serviceProductsRecord[productId].name}
                                    </Text>
                                    <Text
                                      style={{
                                        color: activeColors.accent,
                                      }}
                                    >
                                      Rp.
                                      {serviceProductsRecord[productId]
                                        .addtionalPrice ?? 0}
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
                            Estimated Time: {item.totalDuration} min
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.estimateNTotalText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Total: Rp.{item.totalPrice}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}
            onEndReached={handleFetchOrderSummary}
            onEndReachedThreshold={0.5} // Load more when the user is within 50% of the list's end
            ListFooterComponent={renderFooter}
          />
        </View>
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  titleSummary: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  summaryContainer: {
    flexDirection: "column",
    marginHorizontal: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "500",
    marginVertical: 10,
  },
  item: {
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  orderContainer: {
    marginTop: 10,
    marginHorizontal: 30,
    marginBottom: 30,
    borderRadius: 10,
    padding: 20,
    height: 460,
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
  infoContainer: {
    marginBottom: 10,
  },
  dateContainer: {
    marginBottom: 5,
  },
  dateText: {
    fontWeight: "500",
    fontSize: 18,
    textAlign: "center",
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
});
