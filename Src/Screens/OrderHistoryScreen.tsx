import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  View,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Theme } from "../Contexts/ThemeContext";
import { colors } from "../Config/Theme";
import { Store } from "../Contexts/StoreContext";
import { Auth } from "../Contexts/AuthContext";
import { GetStoreOrderHistoryResponse } from "../Types/ResponseTypes/OrderResponse";
import { apiCallHandler } from "../Middlewares/util";
import { getUserOrderHistory } from "../Middlewares/OrderMiddleware";
import { Header } from "../Components/Header";
import { DropdownPicker } from "../Components/DropdownPicker";
import { AntDesign } from "@expo/vector-icons";
import { User } from "../Contexts/UserContext";
import { Input } from "../Components/Input";
import { set } from "mongoose";
import { AddRatingData } from "../Types/RatingTypes";
import { addRating } from "../Middlewares/RatingMiddleware";

const screenWidth = Dimensions.get("screen").width;
const PAGE_LIMIT = 3;

export const OrderHistoryScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"OrderHistory">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { user } = useContext(User);

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

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear + 1 - new Date(user.createdAt).getFullYear() }, // +1 so atleast it has the same year as currentYear
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
        getUserOrderHistory({
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

  const [viewOrderDetail, setViewOrderDetail] =
    useState<Map<string, boolean>>();
  const toggleOrderDetail = (orderId: string) => {
    setViewOrderDetail((prev) => {
      const newMap = new Map(prev);
      newMap.set(orderId, !newMap.get(orderId)); // Toggle visibility
      return newMap;
    });
  };

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

  const [showRatingModalVisible, setShowRatingModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const handleOpenRatingModal = (orderId: string) => {
    setShowRatingModalVisible(true);
    setSelectedOrderId(orderId);
  };

  const defaultData: AddRatingData = {
    storeId: "",
    serviceId: "",
    orderId: "",
    rating: undefined,
    comment: "",
  };
  const [addRatingData, setAddRatingData] =
    useState<AddRatingData>(defaultData);
  console.log(JSON.stringify(addRatingData, null, 2));

  const handleAddRatingTextChange = <T extends keyof AddRatingData>(
    value: AddRatingData[T],
    field: T
  ) => {
    setAddRatingData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const [serviceOptions, setServiceOptions] =
    useState<[{ label: string; value: string }]>();

  console.log("serviceOptions", serviceOptions);

  const ratingOptions = [
    { label: "1★", value: "1" },
    { label: "2★", value: "2" },
    { label: "3★", value: "3" },
    { label: "4★", value: "4" },
    { label: "5★", value: "5" },
  ];

  useEffect(() => {
    if (selectedOrderId !== "") {
      console.log("selectedOrderId", selectedOrderId);
      const order = data?.orders.find((o) => o.orderId === selectedOrderId);

      if (order) {
        handleAddRatingTextChange(order.orderId ?? "", "orderId");
        handleAddRatingTextChange(order.storeId ?? "", "storeId");

        setServiceOptions(
          order.services.map((service) => ({
            label: service.name,
            value: service.id,
          })) as [{ label: string; value: string }]
        );
      }
    } else {
      setAddRatingData(defaultData);
      setServiceOptions(undefined);
    }
  }, [selectedOrderId]);

  const handleAddRating = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        addRating({
          auth,
          updateAccessToken,
          data: addRatingData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      setShowRatingModalVisible(false);
      setSelectedOrderId("");
      Alert.alert("Success", response.message);
    } else if (response) {
      console.log(response.status, response.message);
      Alert.alert("Error", response.message);
    }
  };

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

      {month && year && (
        <>
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
                      style={[
                        styles.summaryText,
                        { color: activeColors.accent },
                      ]}
                    >
                      {summary.serviceName.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                      : {summary.total}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={[styles.summaryText, { color: activeColors.accent }]}
                >
                  No data available
                </Text>
              )}
            </View>
          </View>

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
                        style={[
                          styles.dateText,
                          { color: activeColors.accent },
                        ]}
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
                            // item.status === "Waiting for Confirmation"
                            //   ? "#FFDD57"
                            //   : item.status === "Waiting for Payment"
                            //   ? "#FFA07A"
                            //   :
                            item.status === "Rejected"
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
                        {item.status === undefined
                          ? "Onsite Order"
                          : item.status}
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

                      {/* rejected reason */}
                      {item.status === "Rejected" && (
                        <View
                          style={[
                            styles.rejectedReasonContainer,
                            { borderColor: activeColors.tertiary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rejectedReasonText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Reason
                          </Text>
                          <Text
                            style={[
                              styles.rejectedReasonText,
                              { color: activeColors.infoColor },
                            ]}
                          >
                            {item.rejectedReason}
                          </Text>
                        </View>
                      )}

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
                            {item.services.map((service, index) => (
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
                                    {service.name}
                                  </Text>
                                  <Text
                                    style={{
                                      color: activeColors.accent,
                                    }}
                                  >
                                    {service.duration} min
                                  </Text>

                                  {service.discount && service.discount > 0 ? (
                                    <Text
                                      style={{
                                        color: activeColors.accent,
                                      }}
                                    >
                                      Rp
                                      {priceFormat(
                                        ((100 - service.discount) *
                                          service.price) /
                                          100
                                      )}{" "}
                                      ({service.discount}% off)
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        color: activeColors.accent,
                                      }}
                                    >
                                      Rp{priceFormat(service.price)}
                                    </Text>
                                  )}
                                </View>

                                {/* service products line */}
                                {service.serviceProducts &&
                                  service.serviceProducts.length > 0 && (
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
                                  {service.serviceProducts?.map(
                                    (serviceProduct, index) => (
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
                                          {serviceProduct.name}
                                        </Text>
                                        <Text
                                          style={{
                                            color: activeColors.accent,
                                          }}
                                        >
                                          Rp
                                          {priceFormat(
                                            serviceProduct.addtionalPrice ?? 0
                                          )}
                                        </Text>
                                      </View>
                                    )
                                  )}
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
                                Total: Rp{priceFormat(item.totalPrice)}
                              </Text>
                            </View>
                          </View>

                          <View style={{ marginTop: 10 }}>
                            <Text
                              style={[
                                styles.workerText,
                                { color: activeColors.accent },
                              ]}
                            >
                              Order Id: {item.orderId}
                            </Text>
                          </View>

                          <View style={{ marginTop: 10 }}>
                            <Text
                              style={[
                                styles.workerText,
                                { color: activeColors.accent },
                              ]}
                            >
                              Worker Name: {item.workerName}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Rating */}
                    {item.status === "Completed" && (
                      <Pressable
                        style={{ position: "absolute", right: 10, top: 10 }}
                        onPress={() =>
                          item.hasRating
                            ? Alert.alert(
                                "Already Rated",
                                "You have already rated all the services from this order.\nThank you for your feedback."
                              )
                            : handleOpenRatingModal(item.orderId)
                        }
                        // disabled={item.hasRating}
                      >
                        <AntDesign
                          name="star"
                          size={20}
                          color={
                            item.hasRating ? "yellow" : activeColors.accent
                          }
                        />
                      </Pressable>
                    )}
                  </View>
                )}
                onEndReached={handleFetchOrderSummary}
                onEndReachedThreshold={0.5} // Load more when the user is within 50% of the list's end
                ListFooterComponent={renderFooter}
              />
            </View>
          )}
        </>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showRatingModalVisible}
        onRequestClose={() => {
          setShowRatingModalVisible(false);
          setSelectedOrderId("");
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
            {/* Content */}
            <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
              {/* title */}
              <View style={styles.modalTitleContainer}>
                <Text
                  style={[
                    styles.modalTitleText,
                    { color: activeColors.accent },
                  ]}
                >
                  Add Rating Form
                </Text>
              </View>

              {/* services */}
              <View style={styles.serviceInputContainer}>
                <DropdownPicker
                  key="services"
                  options={serviceOptions ?? []}
                  selectedValue={addRatingData?.serviceId ?? ""}
                  onValueChange={(serviceId: string) => {
                    handleAddRatingTextChange(serviceId, "serviceId");
                  }}
                  placeHolder="Select service to rate"
                  isInput={true}
                  context="Service"
                />
              </View>
              {/* rating */}
              <View style={styles.ratingInputContainer}>
                <DropdownPicker
                  key="rating"
                  options={ratingOptions}
                  selectedValue={addRatingData?.rating?.toString() ?? ""}
                  onValueChange={(rating: string) => {
                    handleAddRatingTextChange(rating as any, "rating");
                  }}
                  placeHolder="Select rating"
                  isInput={true}
                  context="Service"
                />
              </View>
              {/* comment */}
              <Input
                key="comment"
                context="Comment"
                placeholder="Enter Comment (Optional)"
                value={addRatingData?.comment ?? ""}
                updateValue={(text: string) =>
                  handleAddRatingTextChange(text, "comment")
                }
              />

              {/* submit button */}
              <Pressable
                style={[
                  styles.modalSubmitButton,
                  { backgroundColor: activeColors.accent },
                ]}
                onPress={() => handleAddRating()}
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
            </View>

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setShowRatingModalVisible(false);
                setSelectedOrderId("");
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
    padding: 10,
    height: 420,
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
  workerText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  rejectedReasonContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    marginVertical: 5,
    borderRadius: 5,
  },
  rejectedReasonText: {
    fontWeight: "500",
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 700,
    overflow: "hidden",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  serviceInputContainer: {
    marginBottom: 20,
    zIndex: 99,
  },
  ratingInputContainer: {
    marginBottom: 10,
    zIndex: 98,
  },
  modalTitleContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSubmitButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 50,
  },
  modalSubmitButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
