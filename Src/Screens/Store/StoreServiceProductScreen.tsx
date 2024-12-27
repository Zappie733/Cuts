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
  Image,
  ActivityIndicator,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import {
  addServiceProduct,
  deleteServiceProductById,
  updateServiceProduct,
} from "../../Middlewares/StoreMiddleware/ServiceProductMiddleware";
import { apiCallHandler } from "../../Middlewares/util";
import { Input } from "../../Components/Input";
import {
  AddServiceProductData,
  UpdateServiceProductData,
} from "../../Types/StoreTypes/ServiceProductTypes";
import { SelectSingleImage } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreServiceProductScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreServiceProducts">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

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

  const [selectedServiceProductId, setSelectedServiceProductId] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeleteServiceProduct = async (serviceProductId: string) => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        deleteServiceProductById({
          auth,
          updateAccessToken,
          params: {
            serviceProductId,
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

    setLoading(false);
  };

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  const defaultAddData: AddServiceProductData = {
    name: "",
    quantity: 0,
    alertQuantity: 0,
    description: "",
    isAnOption: null,
    addtionalPrice: 0,
    image: {
      file: "",
    },
  };

  const [addData, setAddData] = useState(defaultAddData);
  console.log("addData", addData);
  const handleAddTextChange = <T extends keyof AddServiceProductData>(
    value: AddServiceProductData[T],
    fieldname: T
  ) => {
    setAddData({
      ...addData,
      [fieldname]: value,
    });
  };

  const handleAddServiceProduct = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        addServiceProduct({
          auth,
          updateAccessToken,
          data: addData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setAddData(defaultAddData);
      setIsAddForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);

  const defaultUpdateData: UpdateServiceProductData = {
    serviceProductId: "",
    name: "",
    quantity: 0,
    alertQuantity: 0,
    description: "",
    isAnOption: null,
    addtionalPrice: 0,
    image: {
      file: "",
    },
  };

  const [updateData, setUpdateData] = useState(defaultUpdateData);
  console.log("updateData", updateData);
  const handleUpdateTextChange = <T extends keyof UpdateServiceProductData>(
    value: UpdateServiceProductData[T],
    fieldname: T
  ) => {
    setUpdateData({
      ...updateData,
      [fieldname]: value,
    });
  };

  const handleSetEditData = (serviceProductId: string) => {
    const serviceProduct = store.serviceProducts.find(
      (serviceProduct) => serviceProduct._id === serviceProductId
    );

    const currentData: UpdateServiceProductData = {
      serviceProductId,
      name: serviceProduct?.name ?? "",
      quantity: serviceProduct?.quantity ?? 0,
      alertQuantity: serviceProduct?.alertQuantity ?? 0,
      description: serviceProduct?.description ?? "",
      isAnOption: serviceProduct?.isAnOption ?? false,
      addtionalPrice: serviceProduct?.addtionalPrice ?? 0,
      image: serviceProduct?.image ?? {
        file: "",
      },
    };

    console.log("forEditData", currentData);
    setUpdateData(currentData);
    setTimeout(() => {
      setIsEditForm(true);
    }, 300);
  };

  const [serviceProductNameEdit, setServiceProductNameEdit] = useState(false);
  const [serviceProductDescriptionEdit, setServiceProductDescriptionEdit] =
    useState(false);
  const [
    serviceProductAdditionalPriceEdit,
    setServiceProductAdditionalPriceEdit,
  ] = useState(false);
  const [serviceProductQuantityEdit, setServiceProductQuantityEdit] =
    useState(false);
  const [serviceProductAlertQuantityEdit, setServiceProductAlertQuantityEdit] =
    useState(false);
  const [serviceProductIsAnOptionEdit, setServiceProductIsAnOptionEdit] =
    useState(false);

  const handleUpdateServiceProduct = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        updateServiceProduct({
          auth,
          updateAccessToken,
          data: updateData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setUpdateData(defaultUpdateData);
      setServiceProductNameEdit(false);
      setServiceProductDescriptionEdit(false);
      setServiceProductAdditionalPriceEdit(false);
      setServiceProductQuantityEdit(false);
      setServiceProductAlertQuantityEdit(false);
      setServiceProductIsAnOptionEdit(false);
      setIsEditForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const isAnOptionOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

  useEffect(() => {
    if (selectedServiceProductId) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [selectedServiceProductId]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>

      {!isAddForm && !isEditForm ? (
        <>
          <Header goBack={handleGoBack} />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Services Products
            </Text>
            {/* add service product button */}
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
            {store.serviceProducts.map((serviceProduct) => (
              <ImageBackground
                key={serviceProduct._id}
                source={{ uri: serviceProduct.image.file }} // Replace with your image URL
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
                    {labelFormat(serviceProduct.name)}
                  </Text>

                  {/* toggle button */}
                  <Pressable
                    onPress={() =>
                      setSelectedServiceProductId(serviceProduct._id ?? "")
                    }
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
                        serviceProduct.name
                      )}?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteServiceProduct(
                              serviceProduct._id ?? ""
                            );
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
                    handleSetEditData(serviceProduct._id ?? "");
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
              setSelectedServiceProductId("");
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
                {store.serviceProducts.map((serviceProduct) => {
                  if (serviceProduct._id === selectedServiceProductId) {
                    // console.log("serviceProduct", serviceProduct);
                    return (
                      <View key={serviceProduct._id}>
                        {/* Title */}
                        <Text
                          style={[
                            styles.modalTitle,
                            {
                              color: activeColors.accent,
                            },
                          ]}
                        >
                          {labelFormat(serviceProduct.name)}
                        </Text>

                        {/* image */}
                        <Image
                          source={{
                            uri: serviceProduct.image.file,
                          }}
                          style={{
                            width: "100%",
                            height: 200,
                            resizeMode: "contain",
                          }}
                        />

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
                            {serviceProduct.description ?? "No description"}
                          </Text>
                        </View>

                        {/* info */}
                        <View style={styles.modalInfo}>
                          {/* additional price */}
                          <Text
                            style={[
                              styles.modalInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>
                              Addtional price:
                            </Text>{" "}
                            Rp
                            {priceFormat(serviceProduct.addtionalPrice ?? 0)}
                          </Text>

                          {/* quantity */}
                          <Text
                            style={[
                              styles.modalInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>Quantity:</Text>{" "}
                            {serviceProduct.quantity}
                          </Text>

                          {/* alert quantity */}
                          <Text
                            style={[
                              styles.modalInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>
                              Alert quantity:
                            </Text>{" "}
                            {serviceProduct.alertQuantity}
                          </Text>

                          {/* is it an option */}
                          <Text
                            style={[
                              styles.modalInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>
                              Is it an option?:
                            </Text>{" "}
                            {serviceProduct.isAnOption ? "Yes" : "No"}
                          </Text>

                          {/* alerted */}
                          <Text
                            style={[
                              styles.modalInfoText,
                              { color: activeColors.accent },
                            ]}
                          >
                            <Text style={{ fontWeight: "400" }}>
                              Has been alerted:
                            </Text>{" "}
                            {serviceProduct.isAlerted ? "Yes" : "No"}
                          </Text>
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
                    setSelectedServiceProductId("");
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
                ? (setIsAddForm(false), setAddData(defaultAddData))
                : (setIsEditForm(false),
                  setUpdateData(defaultUpdateData),
                  setServiceProductNameEdit(false),
                  setServiceProductDescriptionEdit(false),
                  setServiceProductAdditionalPriceEdit(false),
                  setServiceProductQuantityEdit(false),
                  setServiceProductAlertQuantityEdit(false),
                  setServiceProductIsAnOptionEdit(false));
            }}
          />

          {/* title */}
          <View>
            <Text
              style={[
                styles.title,
                { color: activeColors.accent, fontSize: 26 },
              ]}
            >
              {isAddForm
                ? "Add Services Products Form"
                : "Edit Service Products Form"}
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

          {/* form service product */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.formContainer,
                { borderColor: activeColors.tertiary },
              ]}
            >
              <View>
                <SelectSingleImage
                  imageData={isEditForm ? updateData.image : addData.image}
                  handleSetImage={(image: IImageProps | null) =>
                    isEditForm
                      ? handleUpdateTextChange(image ?? { file: "" }, "image")
                      : handleAddTextChange(image ?? { file: "" }, "image")
                  }
                />

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                    marginVertical: 10,
                  }}
                />

                {/* name */}
                <Input
                  key="serviceProductName"
                  context="Name"
                  placeholder="Enter Service Product Name"
                  value={isEditForm ? updateData.name : addData?.name || ""}
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateTextChange(text, "name")
                      : handleAddTextChange(text, "name")
                  }
                  isEditable={isEditForm ? serviceProductNameEdit : undefined}
                  setEditable={
                    isEditForm ? setServiceProductNameEdit : undefined
                  }
                />
                {/* description */}
                <Input
                  key="description"
                  context="Description"
                  placeholder="Enter Description (Optional)"
                  value={
                    isEditForm
                      ? updateData.description || ""
                      : addData.description || ""
                  }
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateTextChange(text, "description")
                      : handleAddTextChange(text, "description")
                  }
                  isEditable={
                    isEditForm ? serviceProductDescriptionEdit : undefined
                  }
                  setEditable={
                    isEditForm ? setServiceProductDescriptionEdit : undefined
                  }
                />

                {/* additional price */}
                <Input
                  key="additionalPrice"
                  context="Additional Price"
                  placeholder="Enter Additional Price (Rp) (optional)"
                  value={
                    isEditForm
                      ? updateData?.addtionalPrice &&
                        updateData?.addtionalPrice?.toString() !== "0"
                        ? updateData?.addtionalPrice?.toString()
                        : ""
                      : addData?.addtionalPrice &&
                        addData?.addtionalPrice?.toString() !== "0"
                      ? addData?.addtionalPrice?.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateTextChange(
                          Number.parseInt(numericValue || "0"),
                          "addtionalPrice"
                        )
                      : handleAddTextChange(
                          Number.parseInt(numericValue || "0"),
                          "addtionalPrice"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={
                    isEditForm ? serviceProductAdditionalPriceEdit : undefined
                  }
                  setEditable={
                    isEditForm
                      ? setServiceProductAdditionalPriceEdit
                      : undefined
                  }
                />

                {/* quantity */}
                <Input
                  key="quantity"
                  context="Quantity"
                  placeholder="Enter Quantity (1 service use 1)"
                  value={
                    isEditForm
                      ? updateData?.quantity &&
                        updateData?.quantity?.toString() !== "0"
                        ? updateData?.quantity?.toString()
                        : ""
                      : addData?.quantity &&
                        addData?.quantity?.toString() !== "0"
                      ? addData?.quantity?.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateTextChange(
                          Number.parseInt(numericValue || "0"),
                          "quantity"
                        )
                      : handleAddTextChange(
                          Number.parseInt(numericValue || "0"),
                          "quantity"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={
                    isEditForm ? serviceProductQuantityEdit : undefined
                  }
                  setEditable={
                    isEditForm ? setServiceProductQuantityEdit : undefined
                  }
                />

                {/* alert quantity */}
                <Input
                  key="alertQuantity"
                  context="Alert Quantity"
                  placeholder="Enter Alert Quantity (min to get alert)"
                  value={
                    isEditForm
                      ? updateData?.alertQuantity &&
                        updateData?.alertQuantity?.toString() !== "0"
                        ? updateData?.alertQuantity?.toString()
                        : ""
                      : addData?.alertQuantity &&
                        addData?.alertQuantity?.toString() !== "0"
                      ? addData?.alertQuantity?.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateTextChange(
                          Number.parseInt(numericValue || "0"),
                          "alertQuantity"
                        )
                      : handleAddTextChange(
                          Number.parseInt(numericValue || "0"),
                          "alertQuantity"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={
                    isEditForm ? serviceProductAlertQuantityEdit : undefined
                  }
                  setEditable={
                    isEditForm ? setServiceProductAlertQuantityEdit : undefined
                  }
                />

                {/* isAnOption */}
                <View style={styles.isAnOptionInputContainer}>
                  <DropdownPicker
                    key="isAnOption"
                    options={isAnOptionOptions}
                    selectedValue={
                      isEditForm
                        ? updateData.isAnOption?.toString() || ""
                        : addData.isAnOption?.toString() || ""
                    }
                    onValueChange={(text: string) =>
                      isEditForm
                        ? handleUpdateTextChange(
                            text === "true"
                              ? true
                              : text === "false"
                              ? false
                              : null,
                            "isAnOption"
                          )
                        : handleAddTextChange(
                            text === "true"
                              ? true
                              : text === "false"
                              ? false
                              : null,
                            "isAnOption"
                          )
                    }
                    placeHolder="Is it an Option?"
                    isInput={true}
                    context="isAnOption"
                    isEditable={
                      isEditForm ? serviceProductIsAnOptionEdit : undefined
                    }
                    setEditable={
                      isEditForm ? setServiceProductIsAnOptionEdit : undefined
                    }
                  />
                </View>

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                    marginVertical: 10,
                  }}
                />

                {/* create order */}
                <Pressable
                  style={[
                    styles.createServiceProductButton,
                    { backgroundColor: activeColors.accent },
                  ]}
                  onPress={() =>
                    isAddForm
                      ? handleAddServiceProduct()
                      : handleUpdateServiceProduct()
                  }
                >
                  <Text
                    style={{
                      color: activeColors.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {isAddForm
                      ? "Add Service Product"
                      : "Update Service Product"}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    // alignItems: "center",
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
  modalInfo: {
    flexDirection: "column",
    alignItems: "center",
  },
  modalInfoText: {
    fontSize: 18,
    fontWeight: "bold",
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
  createServiceProductButton: {
    width: (screenWidth * 2) / 3 + 50,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },

  isAnOptionInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 98,
    marginVertical: 10,
  },
});
