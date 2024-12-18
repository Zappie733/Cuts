import React from "react";
import { useContext, useEffect, useState } from "react";
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
  ImageBackground,
  Modal,
  TextInput,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { ImageSlider } from "../../Components/ImageSlider";
import { ServiceProductObj } from "../../Types/StoreTypes/ServiceProductTypes";
import { apiCallHandler } from "../../Middlewares/util";
import {
  addService,
  deleteService,
  updateService,
} from "../../Middlewares/StoreMiddleware/ServiceMiddleware";
import { Input } from "../../Components/Input";
import { MultiSelectDropdownPicker } from "../../Components/MultiSelectDropdownPicker";
import {
  AddServiceData,
  UpdateServiceData,
} from "../../Types/StoreTypes/ServiceTypes";
import { SelectImages } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreServiceScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreServices">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  // console.log(JSON.stringify(store.services, null, 2));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState("");

  const labelFormat = (label: string) => {
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
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
    return newStr;
  };

  const handleDeleteService = async (serviceId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        deleteService({
          auth,
          updateAccessToken,
          params: {
            serviceId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  const defaultData: AddServiceData = {
    name: "",
    price: 0,
    duration: 0,
    description: "",
    serviceProduct: [],
    images: [],
  };
  const [serviceFormData, setServiceFormData] =
    useState<AddServiceData>(defaultData);
  // console.log("serviceFormData", serviceFormData);

  const handleServiceTextChange = <T extends keyof AddServiceData>(
    value: AddServiceData[T],
    field: T
  ) => {
    setServiceFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const serviceProductsOptions = store.serviceProducts.map(
    (serviceProduct) => ({
      label: serviceProduct.isAnOption
        ? labelFormat(serviceProduct.name)
        : labelFormat(serviceProduct.name) + "*",
      value: serviceProduct._id ?? "",
    })
  );

  const handleAddService = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        addService({
          auth,
          updateAccessToken,
          data: serviceFormData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setServiceFormData(defaultData);
      setIsAddForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);
  const defaultUpdateData: UpdateServiceData = {
    serviceId: "",
    name: "",
    price: 0,
    duration: 0,
    description: "",
    serviceProduct: [],
    images: [],
    discount: 0,
  };

  const [updateServiceFormData, setUpdateServiceFormData] =
    useState<UpdateServiceData>(defaultUpdateData);
  // console.log("updateServiceFormData", updateServiceFormData);

  const handleUpdateServiceTextChange = <T extends keyof UpdateServiceData>(
    value: UpdateServiceData[T],
    field: T
  ) => {
    setUpdateServiceFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSetEditData = (serviceId: string) => {
    const currentData: UpdateServiceData = {
      serviceId,
      name:
        store.services.find((service) => service._id === serviceId)?.name ?? "",
      price:
        store.services.find((service) => service._id === serviceId)?.price ?? 0,
      duration:
        store.services.find((service) => service._id === serviceId)?.duration ??
        0,
      description:
        store.services.find((service) => service._id === serviceId)
          ?.description ?? "",
      serviceProduct:
        store.services.find((service) => service._id === serviceId)
          ?.serviceProduct ?? [],
      images:
        store.services.find((service) => service._id === serviceId)?.images ??
        [],
      discount:
        store.services.find((service) => service._id === serviceId)?.discount ??
        0,
    };
    console.log("forEditData", currentData);
    setUpdateServiceFormData(currentData);
    setIsEditForm(true);
  };

  const [serviceNameEdit, setServiceNameEdit] = useState(false);
  const [serviceDescriptionEdit, setServiceDescriptionEdit] = useState(false);
  const [servicePriceEdit, setServicePriceEdit] = useState(false);
  const [serviceDurationEdit, setServiceDurationEdit] = useState(false);
  const [serviceProductsEdit, setServiceProductsEdit] = useState(false);
  const [serviceDiscountEdit, setServiceDiscountEdit] = useState(false);

  const handleUpdateService = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        updateService({
          auth,
          updateAccessToken,
          data: updateServiceFormData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setUpdateServiceFormData(defaultUpdateData);
      setServiceNameEdit(false);
      setServiceDescriptionEdit(false);
      setServicePriceEdit(false);
      setServiceDurationEdit(false);
      setServiceProductsEdit(false);
      setServiceDiscountEdit(false);
      setIsEditForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  useEffect(() => {
    if (selectedServiceId) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [selectedServiceId]);

  useEffect(() => {
    if (store) {
      getStoreServiceProducts();
    }
  }, [store]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      {!isAddForm && !isEditForm ? (
        <>
          <Header goBack={handleGoBack} />
          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Services
            </Text>
            {/* add service button*/}
            <Pressable
              style={styles.addButtonContainer}
              onPress={() => setIsAddForm(true)}
            >
              <AntDesign name="pluscircle" size={26} color="white" />
            </Pressable>
          </View>

          {/* line separator */}
          <View
            style={{
              borderWidth: 1,
              marginHorizontal: 60,
              borderColor: activeColors.tertiary,
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginHorizontal: 30, marginVertical: 20 }}
          >
            {store.services.map((service) => (
              <ImageBackground
                key={service._id}
                source={{ uri: service.images[0].file }} // Replace with your image URL
                style={[
                  styles.card,
                  {
                    borderColor: activeColors.tertiary,
                  },
                ]}
                imageStyle={styles.image} // Optional for customizing the image
              >
                <View
                  style={[
                    styles.cardContent,
                    {
                      backgroundColor:
                        theme.mode === "dark"
                          ? "rgba(0,0,0,0.4)"
                          : "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Text style={[styles.text, { color: activeColors.accent }]}>
                    {labelFormat(service.name)}
                  </Text>

                  {/* toggle button */}
                  <Pressable
                    onPress={() => setSelectedServiceId(service._id ?? "")}
                  >
                    <Text
                      style={{
                        color: activeColors.infoColor,
                        textDecorationLine: "underline",
                      }}
                    >
                      Show Details
                    </Text>
                  </Pressable>
                </View>

                {/* Delete Icon */}
                <Pressable
                  style={styles.deleteContainer}
                  onPress={() =>
                    Alert.alert(
                      `Are you sure want to delete ${labelFormat(
                        service.name
                      )}?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteService(service._id ?? "");
                          },
                        },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    )
                  }
                >
                  <AntDesign
                    name="delete"
                    size={18}
                    color={activeColors.accent}
                  />
                </Pressable>

                {/* Edit Icon */}
                <Pressable
                  style={styles.editContainer}
                  onPress={() => {
                    handleSetEditData(service._id ?? "");
                  }}
                >
                  <FontAwesome5
                    name="edit"
                    size={18}
                    color={activeColors.accent}
                  />
                </Pressable>
              </ImageBackground>
            ))}
          </ScrollView>

          <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setIsModalVisible(false);
              setSelectedServiceId("");
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
                {store.services.map((service) => {
                  if (service._id === selectedServiceId) {
                    return (
                      <View key={service._id}>
                        {/* Title */}
                        <Text
                          style={[
                            styles.modalTitle,
                            {
                              color: activeColors.accent,
                            },
                          ]}
                        >
                          {labelFormat(service.name)}
                        </Text>

                        {/* image */}
                        <View style={{ width: "100%", height: 200 }}>
                          <ImageSlider
                            images={service.images.map((item) => item.file)}
                          />
                        </View>

                        {/* description */}
                        <View
                          style={[
                            styles.modalInfoDescription,
                            {
                              backgroundColor: activeColors.secondary,
                            },
                          ]}
                        >
                          <Text style={{ color: activeColors.accent }}>
                            {service.description ?? "No description"}
                          </Text>
                        </View>

                        {/* Price and duration */}
                        <View style={styles.modalInfoPriceNDuration}>
                          <Text
                            style={[
                              styles.modalInfoPriceNDurationText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>Price:</Text> Rp
                            {priceFormat(service.price)}
                          </Text>
                          <Text
                            style={[
                              styles.modalInfoPriceNDurationText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>
                              Estimate Duration:
                            </Text>
                            {service.duration} min
                          </Text>
                        </View>

                        {/* Product used */}
                        <View style={{ marginVertical: 5 }}>
                          <Text
                            style={[
                              styles.modalInfoProductText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Products Used:
                          </Text>
                          {service.serviceProduct?.map((productId) => (
                            <Text
                              key={productId}
                              style={[
                                styles.modalInfoProductText,
                                { color: activeColors.accent },
                              ]}
                            >
                              -{" "}
                              {labelFormat(
                                serviceProductsRecord[productId]?.name ?? ""
                              )}
                            </Text>
                          ))}
                          {service.serviceProduct?.length === 0 && (
                            <Text
                              style={[
                                styles.modalInfoProductText,
                                { color: activeColors.accent },
                              ]}
                            >
                              - None
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
                    setIsModalVisible(false);
                    setSelectedServiceId("");
                  }}
                  style={styles.modalCloseButton}
                >
                  <AntDesign
                    name="close"
                    size={22}
                    color={activeColors.accent}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          <Header
            goBack={() => {
              isAddForm
                ? (setIsAddForm(false), setServiceFormData(defaultData))
                : (setIsEditForm(false),
                  setUpdateServiceFormData(defaultUpdateData),
                  setServiceNameEdit(false),
                  setServiceDescriptionEdit(false),
                  setServicePriceEdit(false),
                  setServiceDurationEdit(false),
                  setServiceProductsEdit(false),
                  setServiceDiscountEdit(false));
            }}
          />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              {isAddForm ? "Add Services Form" : "Edit Service Form"}
            </Text>
          </View>

          {/* line separator */}
          <View
            style={{
              borderWidth: 1,
              marginHorizontal: 60,
              borderColor: activeColors.tertiary,
            }}
          />

          {/* form service */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.formContainer,
                { borderColor: activeColors.tertiary },
              ]}
            >
              <View>
                {/* username */}
                <Input
                  key="serviceName"
                  context="Name"
                  placeholder="Enter Service Name"
                  value={
                    isEditForm
                      ? updateServiceFormData.name
                      : serviceFormData?.name || ""
                  }
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateServiceTextChange(text, "name")
                      : handleServiceTextChange(text, "name")
                  }
                  isEditable={isEditForm ? serviceNameEdit : undefined}
                  setEditable={isEditForm ? setServiceNameEdit : undefined}
                />
                {/* description */}
                <Input
                  key="description"
                  context="Description"
                  placeholder="Enter Description (Optional)"
                  value={
                    isEditForm
                      ? updateServiceFormData.description || ""
                      : serviceFormData.description || ""
                  }
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateServiceTextChange(text, "description")
                      : handleServiceTextChange(text, "description")
                  }
                  isEditable={isEditForm ? serviceDescriptionEdit : undefined}
                  setEditable={
                    isEditForm ? setServiceDescriptionEdit : undefined
                  }
                />
                {/* price */}
                <Input
                  key="price"
                  context="Price"
                  placeholder="Enter Service Price (Rp)"
                  value={
                    isEditForm
                      ? updateServiceFormData?.price.toString() !== "0"
                        ? updateServiceFormData?.price.toString()
                        : ""
                      : serviceFormData?.price.toString() !== "0"
                      ? serviceFormData?.price.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateServiceTextChange(
                          Number.parseInt(numericValue || "0"),
                          "price"
                        )
                      : handleServiceTextChange(
                          Number.parseInt(numericValue || "0"),
                          "price"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={isEditForm ? servicePriceEdit : undefined}
                  setEditable={isEditForm ? setServicePriceEdit : undefined}
                />
                {/* duration */}
                <Input
                  key="duration"
                  context="Duration"
                  placeholder="Enter Estimate Duration (min)"
                  value={
                    isEditForm
                      ? updateServiceFormData?.duration.toString() !== "0"
                        ? updateServiceFormData?.duration.toString()
                        : ""
                      : serviceFormData?.duration.toString() !== "0"
                      ? serviceFormData?.duration.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateServiceTextChange(
                          Number.parseInt(numericValue || "0"),
                          "duration"
                        )
                      : handleServiceTextChange(
                          Number.parseInt(numericValue || "0"),
                          "duration"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={isEditForm ? serviceDurationEdit : undefined}
                  setEditable={isEditForm ? setServiceDurationEdit : undefined}
                />

                {/* discount */}
                {isEditForm && (
                  <Input
                    key="discount"
                    context="Discount"
                    placeholder="Enter Discount (%) (Optional)"
                    value={
                      typeof updateServiceFormData?.discount === "number" &&
                      updateServiceFormData?.discount !== 0
                        ? updateServiceFormData?.discount.toString()
                        : ""
                    }
                    updateValue={(text: string) => {
                      // Validate and accept only numeric input
                      const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                      handleUpdateServiceTextChange(
                        Number.parseInt(numericValue || "0"),
                        "discount"
                      );
                    }}
                    isEditable={serviceDiscountEdit}
                    setEditable={setServiceDiscountEdit}
                  />
                )}

                {/* services products */}
                <View style={[styles.serviceInputContainer]}>
                  <MultiSelectDropdownPicker
                    key="serviceProductIds"
                    options={serviceProductsOptions}
                    selectedValues={
                      isEditForm
                        ? updateServiceFormData.serviceProduct || []
                        : serviceFormData.serviceProduct || []
                    }
                    onValuesChange={(newValues) =>
                      isEditForm
                        ? handleUpdateServiceTextChange(
                            newValues,
                            "serviceProduct"
                          )
                        : handleServiceTextChange(newValues, "serviceProduct")
                    }
                    placeHolder="Select Service Products..."
                    isInput={true}
                    context="Service Products"
                    isEditable={isEditForm ? serviceProductsEdit : undefined}
                    setEditable={
                      isEditForm ? setServiceProductsEdit : undefined
                    }
                  />
                </View>

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                  }}
                />

                {/* images */}
                <View style={{ marginVertical: 10 }}>
                  <SelectImages
                    imagesData={
                      isEditForm
                        ? updateServiceFormData.images
                        : serviceFormData.images
                    }
                    handleSetImages={(images: IImageProps[]) => {
                      isEditForm
                        ? handleUpdateServiceTextChange(images, "images")
                        : handleServiceTextChange(images, "images");
                    }}
                  />
                </View>

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                  }}
                />

                {/* create order */}
                <Pressable
                  style={[
                    styles.createServiceButton,
                    { backgroundColor: activeColors.accent },
                  ]}
                  onPress={() =>
                    isAddForm ? handleAddService() : handleUpdateService()
                  }
                >
                  <Text
                    style={{
                      color: activeColors.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {isAddForm ? "Add Service" : "Update Service"}
                  </Text>
                </Pressable>
              </View>
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  card: {
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 100,
    justifyContent: "center", // Center text
    overflow: "hidden", // Ensures border radius is applied to the background image
  },
  cardContent: {
    alignItems: "center",

    flex: 1,
    justifyContent: "center",
  },
  image: {
    borderRadius: 10, // Ensure the image follows the View's border radius
    resizeMode: "stretch",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    paddingVertical: 30,
    paddingHorizontal: 20,
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
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalInfoDescription: {
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  modalInfoPriceNDuration: {
    flexDirection: "column",
    alignItems: "center",
  },
  modalInfoPriceNDurationText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalInfoProductText: {
    fontSize: 16,
  },
  deleteContainer: {
    position: "absolute",
    top: 12,
    left: 10,
  },
  editContainer: {
    position: "absolute",
    top: 12,
    right: 10,
  },
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
  },

  formContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 25,
    marginVertical: 20,
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
  },
  createServiceButton: {
    width: (screenWidth * 2) / 3 + 50,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  serviceInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 100,
    marginVertical: 10,
  },
});
