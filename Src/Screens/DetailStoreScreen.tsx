import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ScrollView,
  Image,
  ImageBackground,
  Pressable,
  Modal,
  Alert,
  ToastAndroid,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Theme } from "../Contexts/ThemeContext";
import { colors } from "../Config/Theme";
import { Auth } from "../Contexts/AuthContext";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Header } from "../Components/Header";
import { Store } from "../Contexts/StoreContext";
import { StoreObj } from "../Types/StoreTypes/StoreTypes";
import { ImageSlider } from "../Components/ImageSlider";
import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  Fontisto,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { PerRating } from "../Components/PerRating";
import { apiCallHandler } from "../Middlewares/util";
import { getRatingSummaryByStoreId } from "../Middlewares/RatingMiddleware";
import { GetRatingSummaryByStoreIdResponse } from "../Types/ResponseTypes/RatingResponse";
import { likeGalleryById } from "../Middlewares/StoreMiddleware/GalleryMiddleware";
import { User } from "../Contexts/UserContext";
import * as Clipboard from "expo-clipboard";
import ImageViewing from "react-native-image-viewing";
import { ImageSource } from "react-native-image-viewing/dist/@types";
import { set } from "mongoose";
import { AddOrderData, chosenServiceProductObj } from "../Types/OrderTypes";
import { Orders } from "../Contexts/OrderContext";

const screenWidth = Dimensions.get("screen").width;

export const DetailStoreScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"DetailStore">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  // const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { store, setStore, refetchStoreById } = useContext(Store);
  const { user, refetchUser } = useContext(User);
  const { orders, setOrders } = useContext(Orders);
  // console.log(JSON.stringify(user, null, 2));
  console.log("orders", JSON.stringify(orders, null, 2));

  useEffect(() => {
    if (!orders) return;
    setOrderData(
      orders.find((order) => order.storeId === store._id) ?? defaultOrderData
    );
  }, [orders]);

  const handleGoBack = () => {
    const defaultStore: StoreObj = {
      _id: "",
      userId: "",
      email: "",
      images: [],
      name: "",
      type: "salon",
      status: "Waiting for Approval",
      district: "",
      subDistrict: "",
      location: "",
      isOpen: false,
      documents: [],
      rejectedReason: "",
      onHoldReason: "",
      approvedBy: "",
      rejectedBy: "",
      holdBy: "",
      unHoldBy: "",
      approvedDate: new Date(0),
      rejectedDate: new Date(0),
      onHoldDate: new Date(0),
      unHoldDate: new Date(0),
      openHour: 0,
      openMinute: 0,
      closeHour: 0,
      closeMinute: 0,
      canChooseWorker: false,
      workers: [],
      services: [],
      serviceProducts: [],
      salesProducts: [],
      storePromotions: [],
      gallery: [],
      toleranceTime: 0,
    };
    setStore(defaultStore);

    const existingOrder = orders.find(
      (order) => order.storeId === orderData.storeId
    );
    if (JSON.stringify(orderData) !== JSON.stringify(defaultOrderData)) {
      if (existingOrder) {
        const newOrders = orders.map((order) =>
          order.storeId === orderData.storeId ? orderData : order
        );
        setOrders(newOrders);
      } else {
        setOrders([...orders, orderData]);
      }
    } else {
      setOrders(orders.filter((order) => order.storeId !== orderData.storeId));
    }

    navigation.goBack();
  };

  const labelFormat = (label: string) => {
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  const operationalHourModification = (value: number) => {
    if (value === 0) {
      return "00";
    }

    if (value < 10) {
      return `0${value}`;
    }

    return value;
  };

  const dateFormat = (date: Date | null) => {
    if (!date) {
      return "";
    }

    return (
      date.toString().split("T")[0] +
      " " +
      date.toString().split("T")[1].split(".")[0]
    );
  };

  const handleCopy = (value: string, label: string) => {
    Clipboard.setStringAsync(value); // Copies the text to clipboard
    ToastAndroid.show(`${label} Copied!`, ToastAndroid.SHORT); // Show a toast message
  };

  const [ratingSummary, setRatingSummary] =
    useState<GetRatingSummaryByStoreIdResponse>();
  // console.log(JSON.stringify(ratingSummary, null, 2));
  const handleFetchRatingSummary = async () => {
    if (store._id !== "") {
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
    }
  };

  useEffect(() => {
    handleFetchRatingSummary();
  }, [store]);

  const [showWorkerAvailabilityModal, setShowWorkerAvailabilityModal] =
    useState(false);

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagesForView, setImagesForView] = useState<ImageSource[]>([]);

  const handleImagePress = (index: number, images: string[] | string) => {
    setSelectedImageIndex(typeof images === "string" ? 0 : index);

    if (typeof images === "string") images = [images];
    setImagesForView(
      images.map((image) => ({
        uri: image,
      }))
    );

    setImageViewerVisible(true);
  };

  const [activeTab, setActiveTab] = useState("services");

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [showServiceProductModal, setShowServiceProductModal] = useState(false);
  const [chosenServiceProductRecord, setChosenServiceProductRecord] = useState<
    Record<string, chosenServiceProductObj>
  >({});
  console.log(JSON.stringify(chosenServiceProductRecord, null, 2));

  const getChosenServiceProductRecord = () => {
    const chosenServiceProductRecordTemp: Record<
      string,
      chosenServiceProductObj
    > = {};
    store.services
      .filter((service) => {
        const serviceProductsOptions = store.serviceProducts.filter(
          (serviceProduct) => {
            return service.serviceProduct?.includes(serviceProduct._id ?? "");
          }
        );

        return serviceProductsOptions.some(
          (serviceProduct) => serviceProduct.isAnOption
        );
      })
      .forEach((service) => {
        const chosenServiceProductObjTemp: chosenServiceProductObj = orders
          .find((order) => order.storeId === store._id)
          ?.chosenServiceProductsIds?.find(
            (chosenServiceProductObj) =>
              chosenServiceProductObj.serviceId === service._id
          ) || {
          serviceId: service._id ?? "",
          serviceProductIds: [],
        };

        chosenServiceProductRecordTemp[service._id ?? ""] =
          chosenServiceProductObjTemp;
      });

    setChosenServiceProductRecord(chosenServiceProductRecordTemp);
  };

  useEffect(() => {
    getChosenServiceProductRecord();
  }, [store]);

  const handleAddOrRemoveServiceProduct = (
    serviceId: string,
    productId: string
  ) => {
    const chosenServiceProductRecordTemp = { ...chosenServiceProductRecord };

    if (chosenServiceProductRecordTemp[serviceId]) {
      if (
        chosenServiceProductRecordTemp[serviceId].serviceProductIds.includes(
          productId
        )
      ) {
        chosenServiceProductRecordTemp[serviceId].serviceProductIds =
          chosenServiceProductRecordTemp[serviceId].serviceProductIds.filter(
            (serviceProductId) => serviceProductId !== productId
          );
      } else {
        chosenServiceProductRecordTemp[serviceId].serviceProductIds.push(
          productId
        );
      }
    }
    setChosenServiceProductRecord(chosenServiceProductRecordTemp);
  };

  const defaultOrderData: AddOrderData = {
    storeId: store._id ?? "",
    serviceIds: [],
    chosenServiceProductsIds: [],
    isManual: false,
    totalPrice: 0,
    totalDuration: 0,
  };
  const [orderData, setOrderData] = useState<AddOrderData>(defaultOrderData);
  console.log(JSON.stringify(orderData, null, 2));

  const handleOrderTextChange = <T extends keyof AddOrderData>(
    value: AddOrderData[T],
    field: T
  ) => {
    if (field === "serviceIds" || field === "chosenServiceProductsIds") {
      let totalPrice = 0;
      let totalDuration = 0;
      console.log("field:", field);
      console.log("value:", value);
      // Use updated value for recalculation
      const updatedServiceIds =
        field === "serviceIds" ? (value as string[]) : orderData.serviceIds;
      let updatedServiceProductsIds =
        field === "chosenServiceProductsIds"
          ? (value as chosenServiceProductObj[])
          : orderData.chosenServiceProductsIds;

      //add chosenServiceProduct if not exist in orderData (user add product before add service)
      if (field === "serviceIds") {
        const serviceId = updatedServiceIds[updatedServiceIds.length - 1];
        const existingItem = orderData.chosenServiceProductsIds?.find(
          (id) => id.serviceId.toString() === serviceId
        );

        if (
          !existingItem &&
          chosenServiceProductRecord[serviceId ?? ""]?.serviceProductIds
            ?.length > 0
        ) {
          updatedServiceProductsIds = [
            ...(orderData.chosenServiceProductsIds || []),
            {
              serviceId: serviceId ?? "",
              serviceProductIds:
                chosenServiceProductRecord[serviceId ?? ""].serviceProductIds,
            },
          ];
        }
      }

      // Filter out chosenServiceProductsIds for removed serviceIds
      const filteredServiceProductsIds = updatedServiceProductsIds?.filter(
        (obj) => updatedServiceIds.includes(obj.serviceId)
      );
      console.log("filteredServiceProductsIds", filteredServiceProductsIds);

      // Calculate totals for selected services
      const selectedServices = store.services.filter((service) =>
        updatedServiceIds.includes(service._id ?? "")
      );

      selectedServices.forEach((service) => {
        if (service.discount !== undefined && service.discount > 0) {
          totalPrice += ((100 - service.discount) * service.price) / 100 || 0;
        } else {
          totalPrice += service.price || 0;
        }
        totalDuration += service.duration || 0;
      });

      // Calculate totals for selected service products
      let selectedServiceProducts: string[] = [];

      filteredServiceProductsIds?.forEach((obj) => {
        selectedServiceProducts.push(...obj.serviceProductIds);
      });

      selectedServiceProducts?.forEach((productId) => {
        totalPrice +=
          store.serviceProducts.find((p) => p._id === productId)
            ?.addtionalPrice || 0;
      });

      console.log("selectedServiceProducts", selectedServiceProducts);
      // Update state with recalculated values`
      setOrderData((prevData) => ({
        ...prevData,
        totalPrice,
        totalDuration,
        [field]: value,
        chosenServiceProductsIds: filteredServiceProductsIds,
      }));
    } else {
      // For other fields, just update the state
      setOrderData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const [selectedProductId, setSelectedProductId] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);

  const [selectedGalleryId, setSelectedGalleryId] = useState("");
  // console.log("selectedGalleryId", selectedGalleryId);
  const [showDetailGalleryModal, setShowDetailGalleryModal] = useState(false);

  const handleLikeGalleryById = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        likeGalleryById({
          auth,
          updateAccessToken,
          params: {
            storeId: store._id,
            galleryId: selectedGalleryId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      // Alert.alert("Success", response.message);
      console.log(response.status, response.message);
      await refetchUser(); //karena berhub dengan user's like array
      await refetchStoreById(store._id || "");
    } else if (response) {
      // Alert.alert("Error", response.message);
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
      {/* Loading Modal */}
      {/* <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal> */}
      <Header goBack={handleGoBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={{ marginBottom: 20 }}>
          {/* name */}
          <View
            style={[
              styles.nameContainer,
              { borderColor: activeColors.secondary },
            ]}
          >
            <View>
              <Text style={[styles.name, { color: activeColors.accent }]}>
                {store.name}
              </Text>
            </View>

            <View>
              <Image
                source={
                  store.type === "salon"
                    ? require("../../assets/salon.png")
                    : require("../../assets/barbershop.png")
                }
                style={{ width: 30, height: 30 }}
              />
            </View>
          </View>

          {/* image */}
          <View
            style={{
              width: "100%",
              height: 250,
              paddingHorizontal: 20,
            }}
          >
            <ImageSlider images={store.images.map((image) => image.file)} />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            {/* Operational hour */}
            <View
              style={[
                styles.operationalHourContainer,
                { borderColor: activeColors.secondary },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.operationalHourText,
                    { color: activeColors.accent },
                  ]}
                >
                  Operational Hour:{" "}
                  {operationalHourModification(store.openHour)}:
                  {operationalHourModification(store.openMinute)} -{" "}
                  {operationalHourModification(store.closeHour)}:
                  {operationalHourModification(store.closeMinute)}
                </Text>
              </View>

              {store.isOpen ? (
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
                <Entypo name="location" size={30} color={activeColors.accent} />
              </View>
              <View>
                <Text
                  style={[styles.addressText, { color: activeColors.accent }]}
                >
                  {store.location.address}
                </Text>
              </View>

              <Pressable
                style={{ position: "absolute", top: 8, right: 8 }}
                onPress={() => handleCopy(store.location.address, "Location")}
              >
                <Feather name="copy" size={24} color={activeColors.accent} />
              </Pressable>
            </View>

            {/* Ratings */}
            <View
              style={[
                styles.ratingsContainer,
                {
                  borderColor: activeColors.secondary,
                  // backgroundColor: activeColors.secondary,
                },
              ]}
            >
              {/* title */}
              <Text
                style={[styles.ratingTitle, { color: activeColors.accent }]}
              >
                Overall Ratings
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

              <Pressable
                onPress={
                  () => navigation.navigate("StoreRatings")
                  // navigation.navigate("StoreRatings", {
                  //   serviceId: store.services[0]._id ?? "",
                  // })
                }
              >
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

            {/* Worker */}
            <Pressable
              style={[
                styles.workerContainer,
                {
                  backgroundColor: activeColors.secondary,
                  borderColor: activeColors.tertiary,
                },
              ]}
              onPress={() => setShowWorkerAvailabilityModal(true)}
            >
              <View style={{ marginRight: 10 }}>
                <Fontisto
                  name="persons"
                  size={30}
                  color={activeColors.accent}
                />
              </View>

              <View>
                <Text
                  style={[styles.workerText, { color: activeColors.accent }]}
                >
                  Active Workers
                </Text>
              </View>
            </Pressable>

            {/* Schedule */}
            <Pressable
              style={[
                styles.scheduleContainer,
                {
                  backgroundColor: activeColors.secondary,
                  borderColor: activeColors.tertiary,
                },
              ]}
              onPress={() => navigation.navigate("StoreSchedule")}
            >
              <View style={{ marginRight: 10 }}>
                <SimpleLineIcons
                  name="clock"
                  size={30}
                  color={activeColors.accent}
                />
              </View>

              <View>
                <Text
                  style={[styles.workerText, { color: activeColors.accent }]}
                >
                  Order Schedule
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Promotions */}
          <View
            style={[
              styles.promotionsContainer,
              { borderColor: activeColors.secondary },
            ]}
          >
            {/* Title */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  P
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  R
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  O
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  M
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  O
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.promotionText,
                    { color: activeColors.infoColor },
                  ]}
                >
                  S
                </Text>
              </View>
            </View>

            {/* Promos */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {store.storePromotions.map((promotion, index) => (
                <Pressable
                  key={promotion._id}
                  onPress={() => handleImagePress(0, promotion.image.file)}
                >
                  <ImageBackground
                    source={{ uri: promotion.image.file }}
                    style={[
                      styles.promotionItemContainer,
                      {
                        borderColor: activeColors.tertiary,
                        width: screenWidth * 0.75,
                        height: 120,
                      },
                    ]}
                    imageStyle={styles.promotionItemImage}
                  >
                    <View
                      style={[
                        styles.promotionItemContent,
                        {
                          backgroundColor:
                            promotion.showImageOnly === true
                              ? "transparent"
                              : theme.mode === "dark"
                              ? "rgba(0,0,0,0.3)"
                              : "rgba(255,255,255,0.1)",
                        },
                      ]}
                    >
                      {promotion.showImageOnly === false && (
                        <>
                          <Text
                            style={[
                              styles.promotionItemText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {promotion.name}
                          </Text>
                          <Text
                            style={[
                              styles.promotionItemStartEndText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Start: {dateFormat(promotion.startDate)}
                          </Text>
                          <Text
                            style={[
                              styles.promotionItemStartEndText,
                              { color: activeColors.accent },
                            ]}
                          >
                            End: {dateFormat(promotion.endDate)}
                          </Text>
                        </>
                      )}
                    </View>
                  </ImageBackground>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Tabs */}
          <View
            style={[
              styles.tabsContainer,
              { borderColor: activeColors.infoColor },
            ]}
          >
            <Pressable
              style={styles.tabsItem}
              onPress={() => setActiveTab("services")}
            >
              <Entypo
                name="scissors"
                size={25}
                color={
                  activeTab === "services"
                    ? activeColors.accent
                    : activeColors.tertiary
                }
                style={styles.tabsIcon}
              />
              <Text
                style={[
                  styles.tabsText,
                  {
                    color:
                      activeTab === "services"
                        ? activeColors.infoColor
                        : activeColors.tertiary,
                    textDecorationLine:
                      activeTab === "services" ? "underline" : "none",
                    fontWeight: activeTab === "services" ? "bold" : "normal",
                  },
                ]}
              >
                Services
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabsItem}
              onPress={() => setActiveTab("products")}
            >
              <Fontisto
                name="shopping-bag-1"
                size={25}
                color={
                  activeTab === "products"
                    ? activeColors.accent
                    : activeColors.tertiary
                }
                style={styles.tabsIcon}
              />
              <Text
                style={[
                  styles.tabsText,
                  {
                    color:
                      activeTab === "products"
                        ? activeColors.infoColor
                        : activeColors.tertiary,
                    textDecorationLine:
                      activeTab === "products" ? "underline" : "none",
                    fontWeight: activeTab === "products" ? "bold" : "normal",
                  },
                ]}
              >
                Products
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabsItem}
              onPress={() => setActiveTab("gallery")}
            >
              <Ionicons
                name="images"
                size={25}
                color={
                  activeTab === "gallery"
                    ? activeColors.accent
                    : activeColors.tertiary
                }
                style={styles.tabsIcon}
              />
              <Text
                style={[
                  styles.tabsText,
                  {
                    color:
                      activeTab === "gallery"
                        ? activeColors.infoColor
                        : activeColors.tertiary,
                    textDecorationLine:
                      activeTab === "gallery" ? "underline" : "none",
                    fontWeight: activeTab === "gallery" ? "bold" : "normal",
                  },
                ]}
              >
                Gallery
              </Text>
            </Pressable>
          </View>

          {/* Services */}
          {activeTab === "services" && (
            <>
              {/* title */}
              <View>
                <Text
                  style={[
                    styles.tabsTitle,
                    {
                      color: activeColors.accent,
                      borderColor: activeColors.tertiary,
                    },
                  ]}
                >
                  Services
                </Text>
              </View>

              <View style={styles.serviceContainer}>
                {store.services?.map((service) => (
                  <View
                    key={service._id}
                    style={[
                      styles.serviceItem,
                      { borderColor: activeColors.tertiary },
                    ]}
                  >
                    {/* Name */}
                    <View>
                      <Text
                        style={[
                          styles.serviceItemTitle,
                          { color: activeColors.accent },
                        ]}
                      >
                        {service.name}
                      </Text>
                    </View>

                    {/* image */}
                    <View style={{ width: "100%", height: 200 }}>
                      <ImageSlider
                        images={service.images.map((image) => image.file)}
                      />
                    </View>

                    {/* Description */}
                    <View>
                      <Text
                        style={[
                          styles.serviceItemDescription,
                          {
                            color: activeColors.accent,
                            borderColor: activeColors.secondary,
                          },
                        ]}
                      >
                        {service.description}
                      </Text>
                    </View>

                    {/* Price */}
                    {service.discount !== undefined && service.discount > 0 ? (
                      <Text
                        style={[
                          styles.serviceItemPrice,
                          {
                            color: activeColors.infoColor,
                            borderColor: activeColors.secondary,
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
                          styles.serviceItemPrice,
                          {
                            color: activeColors.infoColor,
                            borderColor: activeColors.secondary,
                          },
                        ]}
                      >
                        Rp
                        {priceFormat(service.price)}
                      </Text>
                    )}

                    {/* Estimated Duration */}
                    <View>
                      <Text
                        style={[
                          styles.serviceItemDuration,
                          {
                            color: activeColors.accent,
                            borderColor: activeColors.secondary,
                          },
                        ]}
                      >
                        Estimate Duration:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          {service.duration} minutes
                        </Text>
                      </Text>
                    </View>

                    {/* Rating */}
                    <Pressable
                      onPress={() =>
                        navigation.navigate("StoreRatings", {
                          serviceId: service._id as string,
                        })
                      }
                      style={[
                        styles.serviceItemRatingContainer,
                        {
                          borderColor: activeColors.tertiary,
                          backgroundColor: activeColors.secondary,
                        },
                      ]}
                    >
                      <AntDesign name="star" size={20} color="yellow" />
                      <Text
                        style={[
                          styles.serviceItemRatingText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Check Rating
                      </Text>
                    </Pressable>

                    {/* service products options */}
                    {chosenServiceProductRecord[service._id ?? ""] && (
                      <>
                        <View style={styles.serviceItemOptionContainer}>
                          <View style={{ marginRight: 10 }}>
                            <Text
                              style={{
                                color: activeColors.accent,
                                fontSize: 17,
                              }}
                            >
                              Service Products Options:
                            </Text>
                          </View>

                          <Pressable
                            style={[
                              styles.serviceItemOptionButton,
                              {
                                backgroundColor: activeColors.secondary,
                                borderColor: activeColors.tertiary,
                              },
                            ]}
                            onPress={() => {
                              setSelectedServiceId(service._id ?? "");
                              setShowServiceProductModal(true);
                            }}
                          >
                            <Text
                              style={{
                                color: activeColors.accent,
                                fontSize: 15,
                              }}
                            >
                              Choose
                            </Text>
                          </Pressable>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 5,
                          }}
                        >
                          {chosenServiceProductRecord[service._id ?? ""]
                            .serviceProductIds.length > 0 &&
                            store.serviceProducts
                              .filter((serviceProduct) =>
                                chosenServiceProductRecord[
                                  service._id ?? ""
                                ].serviceProductIds.includes(
                                  serviceProduct._id ?? ""
                                )
                              )
                              .map((serviceProduct) => (
                                <View
                                  key={serviceProduct._id}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 5,
                                    borderWidth: 0.5,
                                    borderColor: activeColors.tertiary,
                                    borderRadius: 5,
                                    // overflow: "hidden",
                                  }}
                                >
                                  <Pressable
                                    onPress={() => {
                                      handleImagePress(
                                        0,
                                        serviceProduct.image.file
                                      );
                                    }}
                                  >
                                    <Image
                                      source={{
                                        uri: serviceProduct.image.file,
                                      }}
                                      style={{
                                        width: 50,
                                        height: 50,
                                        resizeMode: "cover",
                                        borderRadius: 5,
                                      }}
                                    />
                                  </Pressable>

                                  <View style={{ marginHorizontal: 10 }}>
                                    <Text
                                      style={{ color: activeColors.accent }}
                                    >
                                      {serviceProduct.name}
                                    </Text>
                                    <Text
                                      style={{ color: activeColors.accent }}
                                    >
                                      Rp{" "}
                                      {priceFormat(
                                        serviceProduct.addtionalPrice ?? 0
                                      )}
                                    </Text>
                                  </View>

                                  {/* remove button */}
                                  <View
                                    style={{
                                      position: "absolute",
                                      top: -5,
                                      right: -5,
                                    }}
                                  >
                                    <Pressable
                                      onPress={() => {
                                        const existingItem =
                                          orderData.chosenServiceProductsIds?.find(
                                            (id) =>
                                              id.serviceId.toString() ===
                                              service._id
                                          );

                                        const newChosenServiceProductsIds =
                                          existingItem && // Update the existing item with new values
                                          orderData.chosenServiceProductsIds
                                            ?.map((item) =>
                                              item.serviceId.toString() ===
                                              service._id
                                                ? {
                                                    ...item,
                                                    serviceProductIds:
                                                      item.serviceProductIds
                                                        ? item.serviceProductIds.includes(
                                                            serviceProduct._id ??
                                                              ""
                                                          )
                                                          ? // If the ID exists, remove it
                                                            item.serviceProductIds.filter(
                                                              (id) =>
                                                                id !==
                                                                serviceProduct._id
                                                            )
                                                          : // If the ID does not exist, add it
                                                            [
                                                              ...item.serviceProductIds,
                                                              serviceProduct._id,
                                                            ].filter(
                                                              (
                                                                id
                                                              ): id is string =>
                                                                id !== undefined
                                                            )
                                                        : [
                                                            serviceProduct._id,
                                                          ].filter(
                                                            (
                                                              id
                                                            ): id is string =>
                                                              id !== undefined
                                                          ), // Initialize if undefined
                                                  }
                                                : item
                                            )
                                            ?.filter(
                                              // Remove the entire object if serviceProductIds is empty
                                              (item) =>
                                                item.serviceProductIds &&
                                                item.serviceProductIds.length >
                                                  0
                                            );

                                        handleOrderTextChange(
                                          newChosenServiceProductsIds,
                                          "chosenServiceProductsIds"
                                        );

                                        handleAddOrRemoveServiceProduct(
                                          service._id ?? "",
                                          serviceProduct._id ?? ""
                                        );
                                      }}
                                      style={{
                                        backgroundColor: activeColors.primary,
                                        borderRadius: 20,
                                      }}
                                    >
                                      <AntDesign
                                        name="close"
                                        size={15}
                                        color={activeColors.accent}
                                      />
                                    </Pressable>
                                  </View>
                                </View>
                              ))}
                        </View>
                      </>
                    )}

                    {/* Add or Remove Button */}
                    <Pressable
                      style={[
                        styles.addOrRemoveServiceButton,
                        {
                          backgroundColor: activeColors.accent,
                          borderColor: activeColors.primary,
                        },
                      ]}
                      onPress={() => {
                        if (!orderData.serviceIds.includes(service._id ?? "")) {
                          handleOrderTextChange(
                            [...orderData.serviceIds, service._id ?? ""],
                            "serviceIds"
                          );
                        } else {
                          handleOrderTextChange(
                            orderData.serviceIds.filter(
                              (id) => id !== service._id
                            ),
                            "serviceIds"
                          );

                          if (chosenServiceProductRecord[service._id ?? ""]) {
                            //reset chosenServiceProduct
                            const chosenServiceProductRecordTemp = {
                              ...chosenServiceProductRecord,
                            };
                            chosenServiceProductRecordTemp[
                              service._id ?? ""
                            ].serviceProductIds = [];

                            setChosenServiceProductRecord(
                              chosenServiceProductRecordTemp
                            );
                          }
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: activeColors.primary,
                          fontSize: 17,
                          fontWeight: "bold",
                        }}
                      >
                        {orderData.serviceIds.includes(service._id ?? "")
                          ? "Remove from Order"
                          : "Add to Order"}
                      </Text>
                    </Pressable>

                    {/* Discount */}
                    {service.discount !== undefined && service.discount > 0 && (
                      <View
                        style={{
                          position: "absolute",
                          top: 15,
                          right: 10,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <MaterialIcons
                          name="discount"
                          size={25}
                          color={activeColors.infoColor}
                          style={{ marginRight: 3 }}
                        />
                        {/* <Text
                          style={{
                            color: activeColors.infoColor,
                            fontSize: 15,
                            fontWeight: "bold",
                          }}
                        >
                          {service.discount}%
                        </Text> */}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Sales Products */}
          {activeTab === "products" && (
            <>
              {/* title */}
              <View>
                <Text
                  style={[
                    styles.tabsTitle,
                    {
                      color: activeColors.accent,
                      borderColor: activeColors.tertiary,
                    },
                  ]}
                >
                  Products
                </Text>
              </View>

              <View style={styles.productsContainer}>
                {store.salesProducts?.map((salesProduct) => (
                  <Pressable
                    key={salesProduct._id}
                    onPress={() => {
                      setSelectedProductId(salesProduct._id ?? "");
                      setShowProductModal(true);
                    }}
                  >
                    <View
                      style={[
                        styles.productItem,
                        { borderColor: activeColors.tertiary },
                      ]}
                    >
                      <View style={{ width: "100%" }}>
                        <Image
                          source={{ uri: salesProduct.images[0].file }}
                          style={styles.productItemImage}
                        />
                      </View>

                      <View>
                        <Text
                          style={[
                            styles.productItemText,
                            { color: activeColors.accent },
                          ]}
                        >
                          {salesProduct.name}
                        </Text>
                        <Text
                          style={[
                            styles.productItemText,
                            { color: activeColors.accent },
                          ]}
                        >
                          Rp{priceFormat(salesProduct.price)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Gallery */}
          {activeTab === "gallery" && (
            <>
              {/* title */}
              <View>
                <Text
                  style={[
                    styles.tabsTitle,
                    {
                      color: activeColors.accent,
                      borderColor: activeColors.tertiary,
                    },
                  ]}
                >
                  Gallery
                </Text>
              </View>

              {/* images */}
              <View style={styles.galleryContainer}>
                {store.gallery?.map((galleryObj) => (
                  <Pressable
                    key={galleryObj._id}
                    onPress={() => {
                      setSelectedGalleryId(galleryObj._id ?? "");
                      setShowDetailGalleryModal(true);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: galleryObj.images[0].file }}
                      style={[
                        styles.galleryItem,
                        {
                          borderColor: activeColors.tertiary,
                        },
                      ]}
                      imageStyle={styles.galleryImage}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Fullscreen Image Viewer */}
      <ImageViewing
        images={imagesForView}
        imageIndex={selectedImageIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />

      {/* Worker Availability Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWorkerAvailabilityModal}
        onRequestClose={() => setShowWorkerAvailabilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalWorkerContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {/* Content */}
            {store.workers.length === 0 && (
              <View>
                <Text
                  style={{
                    color: activeColors.accent,
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  No Active Workers
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                {store.workers.map((worker) => (
                  <WorkerComponent
                    key={worker._id}
                    name={worker.firstName + " " + worker.lastName}
                    age={worker.age}
                    isOnDuty={worker.isOnDuty ? true : false}
                    joinDate={worker.joinDate}
                    image={worker.image.file}
                    role={worker.role}
                    openImage={() => handleImagePress(0, worker.image.file)}
                  />
                ))}
              </View>
            </ScrollView>
            {/* Close Button */}
            <Pressable
              onPress={() => setShowWorkerAvailabilityModal(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* service product modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showServiceProductModal}
        onRequestClose={() => setShowServiceProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalServiceProductContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {store.services
                .find((service) => service._id === selectedServiceId)
                ?.serviceProduct?.map((serviceProductId) => {
                  const serviceProduct = store.serviceProducts.find(
                    (serviceProduct) =>
                      serviceProduct._id === serviceProductId &&
                      serviceProduct.isAnOption === true
                  );

                  if (!serviceProduct) return;

                  return (
                    <View key={serviceProduct?._id}>
                      <View
                        style={[
                          styles.modalServiceProductItemContainer,
                          {
                            borderColor: activeColors.tertiary,
                          },
                        ]}
                      >
                        {/* top */}
                        <View style={styles.modalServiceProductItemTop}>
                          {/* image */}
                          <View>
                            <Image
                              source={{ uri: serviceProduct?.image.file }}
                              style={styles.modalServiceProductItemImage}
                            />
                          </View>

                          {/* item content */}
                          <View style={styles.modalServiceProductItemContent}>
                            <Text
                              style={[
                                styles.modalServiceProductItemContentName,
                                { color: activeColors.accent },
                              ]}
                            >
                              {serviceProduct?.name}
                            </Text>

                            <Text
                              style={[
                                styles.modalServiceProductItemContentPriceNQuantity,
                                { color: activeColors.accent },
                              ]}
                            >
                              <Text style={{ fontWeight: 300 }}>
                                Addtional Price:
                              </Text>{" "}
                              Rp
                              {priceFormat(serviceProduct?.addtionalPrice ?? 0)}
                            </Text>

                            <Text
                              style={[
                                styles.modalServiceProductItemContentPriceNQuantity,
                                { color: activeColors.accent },
                              ]}
                            >
                              <Text style={{ fontWeight: 300 }}>Quantity:</Text>{" "}
                              {serviceProduct.quantity}
                            </Text>
                          </View>
                        </View>

                        {/* description */}
                        <View
                          style={[
                            styles.modalServiceProductItemDescription,
                            { borderColor: activeColors.tertiary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.modalServiceProductItemDescriptionText,
                              { color: activeColors.accent },
                            ]}
                          >
                            {serviceProduct.description}
                          </Text>
                        </View>

                        {/* action button */}
                        <View
                          style={styles.modalServiceProductItemButtonContainer}
                        >
                          <Pressable
                            style={[
                              styles.modalServiceProductItemButton,
                              {
                                borderColor: activeColors.accent,
                                backgroundColor:
                                  !chosenServiceProductRecord[
                                    selectedServiceId
                                  ].serviceProductIds.includes(
                                    serviceProduct._id ?? ""
                                  ) && serviceProduct.quantity !== 0
                                    ? activeColors.secondary
                                    : !chosenServiceProductRecord[
                                        selectedServiceId
                                      ].serviceProductIds.includes(
                                        serviceProduct._id ?? ""
                                      ) && serviceProduct.quantity === 0
                                    ? activeColors.disabledColor
                                    : activeColors.secondary,
                              },
                            ]}
                            onPress={() => {
                              const existingItem =
                                orderData.chosenServiceProductsIds?.find(
                                  (id) =>
                                    id.serviceId.toString() ===
                                    selectedServiceId
                                );
                              const newChosenServiceProductsIds = existingItem
                                ? // Update the existing item with new values
                                  orderData.chosenServiceProductsIds
                                    ?.map((item) =>
                                      item.serviceId.toString() ===
                                      selectedServiceId
                                        ? {
                                            ...item,
                                            serviceProductIds:
                                              item.serviceProductIds
                                                ? item.serviceProductIds.includes(
                                                    serviceProduct._id ?? ""
                                                  )
                                                  ? // If the ID exists, remove it
                                                    item.serviceProductIds.filter(
                                                      (id) =>
                                                        id !==
                                                        serviceProduct._id
                                                    )
                                                  : // If the ID does not exist, add it
                                                    [
                                                      ...item.serviceProductIds,
                                                      serviceProduct._id,
                                                    ].filter(
                                                      (id): id is string =>
                                                        id !== undefined
                                                    )
                                                : [serviceProduct._id].filter(
                                                    (id): id is string =>
                                                      id !== undefined
                                                  ), // Initialize if undefined
                                          }
                                        : item
                                    )
                                    ?.filter(
                                      // Remove the entire object if serviceProductIds is empty
                                      (item) =>
                                        item.serviceProductIds &&
                                        item.serviceProductIds.length > 0
                                    )
                                : // Add a new item if no match is found
                                  [
                                    ...(orderData.chosenServiceProductsIds ||
                                      []),
                                    {
                                      serviceId: selectedServiceId,
                                      serviceProductIds: [
                                        serviceProduct._id,
                                      ].filter(
                                        (id): id is string => id !== undefined
                                      ), // Initialize as an array and filter out undefined
                                    },
                                  ];

                              handleOrderTextChange(
                                newChosenServiceProductsIds,
                                "chosenServiceProductsIds"
                              );

                              handleAddOrRemoveServiceProduct(
                                selectedServiceId,
                                serviceProduct._id ?? ""
                              );
                            }}
                            disabled={
                              !chosenServiceProductRecord[
                                selectedServiceId
                              ].serviceProductIds.includes(
                                serviceProduct._id ?? ""
                              ) && serviceProduct.quantity === 0
                                ? true
                                : false
                            }
                          >
                            <Text
                              style={{
                                color: activeColors.accent,
                                fontSize: 13,
                              }}
                            >
                              {chosenServiceProductRecord[
                                selectedServiceId
                              ].serviceProductIds.includes(
                                serviceProduct._id ?? ""
                              )
                                ? "Remove"
                                : "Add"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </ScrollView>

            {/* Close Button */}
            <Pressable
              onPress={() => setShowServiceProductModal(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* product modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showProductModal}
        onRequestClose={() => {
          setShowProductModal(false);
          setSelectedProductId("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalProductContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {store.salesProducts.map((salesProduct) => {
              if (salesProduct._id === selectedProductId) {
                // console.log("salesProduct", salesProduct);
                return (
                  <View key={salesProduct._id}>
                    {/* Title */}
                    <Text
                      style={[
                        styles.modalProductName,
                        {
                          color: activeColors.accent,
                        },
                      ]}
                    >
                      {labelFormat(salesProduct.name)}
                    </Text>

                    {/* image */}
                    <View style={{ width: "100%", height: 200 }}>
                      <ImageSlider
                        images={salesProduct.images.map((item) => item.file)}
                      />
                    </View>

                    {/* description */}
                    <View
                      style={[
                        styles.modalProductDescription,
                        {
                          backgroundColor: activeColors.secondary,
                        },
                      ]}
                    >
                      <Text style={{ color: activeColors.accent }}>
                        {salesProduct.description ?? "No description"}
                      </Text>
                    </View>

                    {/* info */}
                    <View style={styles.modalProductInfo}>
                      {/* price */}
                      <Text
                        style={[
                          styles.modalProductInfoPrice,
                          { color: activeColors.accent },
                        ]}
                      >
                        <Text style={{ fontWeight: "400" }}>Price:</Text> Rp
                        {priceFormat(salesProduct.price ?? 0)}
                      </Text>
                    </View>

                    {/* links */}
                    <View
                      style={{
                        marginVertical: 5,
                      }}
                    >
                      <Text
                        style={[
                          styles.modalProductInfoLinkTitle,
                          {
                            color: activeColors.infoColor,
                          },
                        ]}
                      >
                        Buy links
                      </Text>
                      {salesProduct.links.map((link) => (
                        <View
                          style={[
                            styles.modalProductInfoLinkItemContainer,
                            { borderColor: activeColors.tertiary },
                          ]}
                          key={link.label}
                        >
                          <View style={{ width: "30%" }}>
                            <Text
                              style={[
                                styles.modalProductInfoLinkText,
                                {
                                  color: activeColors.infoColor,
                                  marginLeft: 10,
                                },
                              ]}
                            >
                              {labelFormat(link.label ? link.label : "")}
                              {": "}
                            </Text>
                          </View>

                          <View style={{ width: "70%" }}>
                            <Text
                              style={[
                                styles.modalProductInfoLinkText,
                                {
                                  color: activeColors.accent,
                                  marginLeft: 5,
                                  textDecorationLine: "underline",
                                  width: "70%",
                                  // textAlign: "center",
                                },
                              ]}
                            >
                              {link.link ? link.link : ""}
                            </Text>
                          </View>

                          <Pressable
                            onPress={() => handleCopy(link.link, "Link")}
                            style={{
                              position: "absolute",
                              right: 10,
                            }}
                          >
                            <Feather
                              name="copy"
                              size={24}
                              color={activeColors.accent}
                            />
                          </Pressable>
                        </View>
                      ))}
                      {salesProduct.links.length === 0 && (
                        <Text
                          style={[
                            styles.modalProductInfoLinkText,
                            { color: activeColors.accent },
                          ]}
                        >
                          None
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
              return null;
            })}

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setShowProductModal(false);
                setSelectedProductId("");
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* detail gallery modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDetailGalleryModal}
        onRequestClose={() => {
          setShowDetailGalleryModal(false);
          setSelectedGalleryId("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDetailStoreContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {store.gallery?.map((galleryObj) => {
              if (galleryObj._id === selectedGalleryId) {
                return (
                  <View key={galleryObj._id}>
                    {/* line separator */}
                    <View
                      style={{
                        borderWidth: 0.5,
                        borderColor: activeColors.tertiary,
                      }}
                    />

                    {/* image */}
                    <View style={{ width: "100%", height: 300 }}>
                      <ImageSlider
                        images={galleryObj.images.map((image) => image.file)}
                      />
                    </View>

                    {/* line separator */}
                    <View
                      style={{
                        borderWidth: 0.5,
                        borderColor: activeColors.tertiary,
                      }}
                    />

                    {/* likes */}
                    <View
                      style={{
                        flexDirection: "row",
                        marginVertical: 10,
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Pressable onPress={() => handleLikeGalleryById()}>
                        <AntDesign
                          name={
                            user.likes?.find(
                              (like) => like.imageId === galleryObj._id
                            )
                              ? "like1"
                              : "like2"
                          }
                          size={24}
                          color={activeColors.accent}
                        />
                      </Pressable>
                      <View>
                        <Text
                          style={[
                            styles.modalDetailStoreLikes,
                            { color: activeColors.accent },
                          ]}
                        >
                          {galleryObj.likes}
                        </Text>
                      </View>
                    </View>

                    {/* caption */}
                    <Text
                      style={[
                        styles.modalDetailStoreCaption,
                        { color: activeColors.accent },
                      ]}
                    >
                      {galleryObj.caption}
                    </Text>
                  </View>
                );
              }
            })}
            {/* Close Button */}
            <Pressable
              onPress={() => {
                setShowDetailGalleryModal(false);
                setSelectedGalleryId("");
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

interface IWorkerComponentProps {
  name: string;
  age: number;
  isOnDuty: boolean;
  image: string;
  joinDate: Date;
  role: string;
  openImage?: () => void;
}

const WorkerComponent = ({
  name,
  age,
  isOnDuty,
  joinDate,
  image,
  role,
  openImage,
}: IWorkerComponentProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View
      style={[
        styles.workerItemContainer,
        { borderBottomColor: activeColors.tertiary },
      ]}
    >
      <Pressable onPress={openImage}>
        <Image source={{ uri: image }} style={styles.workerItemImage} />
      </Pressable>

      <View>
        <Text
          style={[styles.workerItemText, { color: activeColors.infoColor }]}
        >
          <Text
            style={[styles.workerItemLabel, { color: activeColors.accent }]}
          >
            Name:{" "}
          </Text>
          {name}
        </Text>
        <Text style={[styles.workerItemText, { color: activeColors.accent }]}>
          <Text
            style={[styles.workerItemLabel, { color: activeColors.accent }]}
          >
            Age:{" "}
          </Text>
          {age}
        </Text>
        <Text
          style={[styles.workerItemText, { color: activeColors.infoColor }]}
        >
          <Text
            style={[styles.workerItemLabel, { color: activeColors.accent }]}
          >
            Role:{" "}
          </Text>{" "}
          {role}
        </Text>
        <Text
          style={[styles.workerItemText, { color: activeColors.infoColor }]}
        >
          <Text
            style={[styles.workerItemLabel, { color: activeColors.accent }]}
          >
            Status:{" "}
          </Text>{" "}
          {isOnDuty ? "On Duty" : "Off Duty"}
        </Text>
        <Text style={[styles.workerItemText, { color: activeColors.accent }]}>
          <Text
            style={[styles.workerItemLabel, { color: activeColors.accent }]}
          >
            Join Since:{" "}
          </Text>{" "}
          {joinDate.toString().split("T")[0]}
        </Text>
      </View>
    </View>
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
  // loaderContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  // },

  nameContainer: {
    marginHorizontal: 20,
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 15,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    marginRight: 5,
  },

  infoContainer: {
    flexDirection: "column",
  },
  operationalHourContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 5,
    borderBottomWidth: 1,
  },
  operationalHourText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },

  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingLeft: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 5,
  },

  ratingsContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  ratingTitle: {
    fontSize: 20,
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

  workerContainer: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  workerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalWorkerContainer: {
    width: "90%",
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
  modalContent: {
    flexDirection: "column",
  },
  workerItemContainer: {
    padding: 20,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
  },
  workerItemImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  workerItemText: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 3,
  },
  workerItemLabel: {
    fontWeight: "700",
  },

  scheduleContainer: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  promotionsContainer: {
    marginHorizontal: 20,
    borderTopWidth: 1,
    marginBottom: 10,
  },
  promotionText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  promotionItemContainer: {
    borderWidth: 1,
    overflow: "hidden",
  },
  promotionItemContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  promotionItemImage: {
    resizeMode: "stretch",
  },
  promotionItemText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  promotionItemStartEndText: {
    fontSize: 15,
    fontWeight: "bold",
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  tabsItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  tabsIcon: {
    marginRight: 5,
  },
  tabsTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 30,
    borderBottomWidth: 1,
  },

  serviceContainer: {
    flexDirection: "column",
    marginVertical: 10,
    marginHorizontal: 30,
  },
  serviceItem: {
    flex: 1,
    flexDirection: "column",
    padding: 20,
    borderWidth: 0.5,
    borderRadius: 20,
    marginBottom: 20,
  },
  serviceItemTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  serviceItemDescription: {
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 5,
    textAlign: "center",
    marginVertical: 5,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  serviceItemPrice: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    textAlign: "center",
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  serviceItemDuration: {
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 5,
    textAlign: "center",
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  serviceItemRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderWidth: 1,
    borderRadius: 20,
  },
  serviceItemRatingText: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  serviceItemOptionContainer: {
    marginTop: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceItemOptionButton: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  addOrRemoveServiceButton: {
    marginTop: 10,
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalServiceProductContainer: {
    width: "90%",
    padding: 20,
    paddingRight: 35,
    paddingTop: 35,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 700,
    overflow: "hidden",
    flexDirection: "column",
  },
  modalServiceProductItemContainer: {
    width: "100%",
    flexDirection: "column",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalServiceProductItemTop: {
    flexDirection: "row",
  },
  modalServiceProductItemImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 10,
  },
  modalServiceProductItemContent: {
    flexDirection: "column",
    paddingHorizontal: 10,
    marginTop: 20,
  },
  modalServiceProductItemContentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalServiceProductItemContentPriceNQuantity: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 5,
  },
  modalServiceProductItemDescription: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  modalServiceProductItemDescriptionText: {
    fontSize: 14,
    fontWeight: "400",
  },
  modalServiceProductItemButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalServiceProductItemButton: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },

  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 5,
    columnGap: 5,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  productItem: {
    width: (screenWidth - 65) / 2,
    borderWidth: 0.5,
    overflow: "hidden",
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  productItemImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 3,
  },
  productItemText: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 5,
  },
  modalProductContainer: {
    width: "90%",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 10,
    // alignItems: "center",
    borderWidth: 1,
  },
  modalProductName: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  modalProductDescription: {
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    // marginHorizontal: 10,
  },
  modalProductInfo: {
    flexDirection: "column",
    alignItems: "center",
  },
  modalProductInfoPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalProductInfoLinkTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  modalProductInfoLinkText: {
    fontSize: 16,
  },
  modalProductInfoLinkItemContainer: {
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
  },

  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 3,
    columnGap: 3,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  galleryItem: {
    width: (screenWidth - 66) / 3,
    height: (screenWidth - 66) / 3,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  galleryImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  modalDetailStoreLikes: {
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 5,
    marginRight: 10,
  },
  modalDetailStoreCaption: {
    fontSize: 18,
    fontWeight: "400",
    marginVertical: 5,
    paddingHorizontal: 30,
  },
  modalDetailStoreContainer: {
    width: "90%",
    paddingVertical: 40,
    borderRadius: 10,
    // alignItems: "center",
    borderWidth: 1,
  },
});
