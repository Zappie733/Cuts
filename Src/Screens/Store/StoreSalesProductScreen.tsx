import React, { useCallback } from "react";
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
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { apiCallHandler } from "../../Middlewares/util";
import {
  addSalesProduct,
  deleteSalesProductById,
  updateSalesProduct,
} from "../../Middlewares/StoreMiddleware/SalesProductMiddleware";
import { ImageSlider } from "../../Components/ImageSlider";
import { IAuthObj } from "../../Types/ContextTypes/AuthContextTypes";
import { useFocusEffect } from "@react-navigation/native";
import {
  AddSalesProductData,
  UpdateSalesProductData,
} from "../../Types/StoreTypes/SalesProductTypes";
import { Input } from "../../Components/Input";
import { SelectImages } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreSalesProductScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreSalesProducts">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

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

  const [selectedSalesProductId, setSelectedSalesProductId] = useState("");

  const handleDeleteSalesProduct = async (salesProductId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        deleteSalesProductById({
          auth,
          updateAccessToken,
          params: {
            salesProductId,
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

  const [isModalVisible, setIsModalVisible] = useState(false);

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  const defaultAddData: AddSalesProductData = {
    name: "",
    description: "",
    images: [],
    price: 0,
    links: [],
  };

  const [addData, setAddData] = useState(defaultAddData);
  console.log("addData", addData);

  const handleAddTextChange = <T extends keyof AddSalesProductData>(
    value: AddSalesProductData[T],
    fieldname: T
  ) => {
    setAddData({
      ...addData,
      [fieldname]: value,
    });
  };

  const handleAddSalesProduct = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        addSalesProduct({
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
  };

  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);

  const defaultUpdateData: UpdateSalesProductData = {
    salesProductId: "",
    name: "",
    description: "",
    images: [],
    price: 0,
    links: [],
  };

  const [updateData, setUpdateData] = useState(defaultUpdateData);
  console.log("updateData", updateData);

  const handleUpdateTextChange = <T extends keyof UpdateSalesProductData>(
    value: UpdateSalesProductData[T],
    fieldname: T
  ) => {
    setUpdateData({
      ...updateData,
      [fieldname]: value,
    });
  };

  const handleSetEditData = (salesProductId: string) => {
    const salesProduct = store.salesProducts.find(
      (salesProduct) => salesProduct._id === salesProductId
    );

    const currentData: UpdateSalesProductData = {
      salesProductId,
      name: salesProduct?.name ?? "",
      description: salesProduct?.description ?? "",
      images: salesProduct?.images ?? [],
      price: salesProduct?.price ?? 0,
      links: salesProduct?.links ?? [],
    };

    console.log("forEditData", currentData);
    setUpdateData(currentData);
    setTimeout(() => {
      setIsEditForm(true);
    }, 300);
  };

  const [salesProductNameEdit, setSalesProductNameEdit] = useState(false);
  const [salesProductDescriptionEdit, setSalesProductDescriptionEdit] =
    useState(false);
  const [salesProductPriceEdit, setSalesProductPriceEdit] = useState(false);
  const [salesProductLinksEdit, setSalesProductLinksEdit] = useState<boolean[]>(
    []
  );
  const [initEdit, setInitEdit] = useState<boolean>(false);

  // Initialize the edit state array when links are updated
  useEffect(() => {
    if (initEdit) {
      setSalesProductLinksEdit(updateData.links.map(() => false));
    }
  }, [initEdit]);

  const toggleEditable = (index: number, value: boolean) => {
    const updatedEditState = [...salesProductLinksEdit];
    updatedEditState[index] = value;
    setSalesProductLinksEdit(updatedEditState);
  };

  const handleUpdateSalesProduct = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        updateSalesProduct({
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
      setSalesProductNameEdit(false);
      setSalesProductDescriptionEdit(false);
      setSalesProductPriceEdit(false);
      setSalesProductLinksEdit([]);
      setIsEditForm(false);
      setInitEdit(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  useEffect(() => {
    if (selectedSalesProductId) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [selectedSalesProductId]);

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
              Sales Products
            </Text>
            {/* add salesProduct product button */}
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
            {store.salesProducts.map((salesProduct) => (
              <ImageBackground
                key={salesProduct._id}
                source={{ uri: salesProduct.images[0].file }} // Replace with your image URL
                style={[
                  styles.card,
                  {
                    borderColor: activeColors.tertiary,
                  },
                ]}
                imageStyle={styles.image} // Optional for customizing the image
              >
                {/* name */}
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
                    {labelFormat(salesProduct.name)}
                  </Text>

                  {/* toggle button */}
                  <Pressable
                    onPress={() =>
                      setSelectedSalesProductId(salesProduct._id ?? "")
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
                        salesProduct.name
                      )}?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteSalesProduct(salesProduct._id ?? "");
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
                    handleSetEditData(salesProduct._id ?? "");
                    setInitEdit(true);
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
              setSelectedSalesProductId("");
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
                {store.salesProducts.map((salesProduct) => {
                  if (salesProduct._id === selectedSalesProductId) {
                    // console.log("salesProduct", salesProduct);
                    return (
                      <View key={salesProduct._id}>
                        {/* Title */}
                        <Text
                          style={[
                            styles.modalTitle,
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
                            images={salesProduct.images.map(
                              (item) => item.file
                            )}
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
                            {salesProduct.description ?? "No description"}
                          </Text>
                        </View>

                        {/* info */}
                        <View style={styles.modalInfo}>
                          {/* price */}
                          <Text
                            style={[
                              styles.modalInfoText,
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
                              styles.modalInfoLinkText,
                              { color: activeColors.accent },
                            ]}
                          >
                            Buy links
                          </Text>
                          {salesProduct.links.map((link) => (
                            <View
                              style={{ flexDirection: "row" }}
                              key={link.label}
                            >
                              <Text
                                style={[
                                  styles.modalInfoLinkText,
                                  {
                                    color: activeColors.accent,
                                    marginLeft: 10,
                                  },
                                ]}
                              >
                                {labelFormat(link.label ? link.label : "")}
                                {": "}
                              </Text>
                              <Text
                                style={[
                                  styles.modalInfoLinkText,
                                  {
                                    color: activeColors.accent,
                                    marginLeft: 5,
                                    textDecorationLine: "underline",
                                    width: "70%",
                                  },
                                ]}
                              >
                                {link.link ? link.link : ""}
                              </Text>
                            </View>
                          ))}
                          {salesProduct.links.length === 0 && (
                            <Text
                              style={[
                                styles.modalInfoLinkText,
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
                    setIsModalVisible(false);
                    setSelectedSalesProductId("");
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
                  setSalesProductNameEdit(false),
                  setSalesProductDescriptionEdit(false),
                  setSalesProductPriceEdit(false),
                  setSalesProductLinksEdit([]),
                  setInitEdit(false));
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
                ? "Add Sales Products Form"
                : "Edit Sales Products Form"}
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

          {/* form sales product */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.formContainer,
                { borderColor: activeColors.tertiary },
              ]}
            >
              <View>
                {/* name */}
                <Input
                  key="name"
                  context="Name"
                  placeholder="Enter Sales Product Name"
                  value={isEditForm ? updateData.name : addData?.name || ""}
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateTextChange(text, "name")
                      : handleAddTextChange(text, "name")
                  }
                  isEditable={isEditForm ? salesProductNameEdit : undefined}
                  setEditable={isEditForm ? setSalesProductNameEdit : undefined}
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
                    isEditForm ? salesProductDescriptionEdit : undefined
                  }
                  setEditable={
                    isEditForm ? setSalesProductDescriptionEdit : undefined
                  }
                />
                {/* price */}
                <Input
                  key="price"
                  context="Price"
                  placeholder="Enter Sales Product Price (Rp)"
                  value={
                    isEditForm
                      ? updateData?.price.toString() !== "0"
                        ? updateData?.price.toString()
                        : ""
                      : addData?.price.toString() !== "0"
                      ? addData?.price.toString()
                      : ""
                  }
                  updateValue={(text: string) => {
                    // Validate and accept only numeric input
                    const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                    isEditForm
                      ? handleUpdateTextChange(
                          Number.parseInt(numericValue || "0"),
                          "price"
                        )
                      : handleAddTextChange(
                          Number.parseInt(numericValue || "0"),
                          "price"
                        ); // Ensure at least "0" is passed if empty
                  }}
                  isEditable={isEditForm ? salesProductPriceEdit : undefined}
                  setEditable={
                    isEditForm ? setSalesProductPriceEdit : undefined
                  }
                />

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
                    imagesData={isEditForm ? updateData.images : addData.images}
                    handleSetImages={(images: IImageProps[]) => {
                      isEditForm
                        ? handleUpdateTextChange(images, "images")
                        : handleAddTextChange(images, "images");
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

                {/* Links */}
                <View style={{ marginVertical: 10 }}>
                  {/* title */}
                  <Text
                    style={[
                      styles.linkTitle,
                      {
                        color: activeColors.tertiary,
                      },
                    ]}
                  >
                    Links
                  </Text>

                  {/* links */}
                  {isAddForm
                    ? addData.links.map((linkObj, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                          <Input
                            key={`label-${index}`}
                            context="Link Label"
                            placeholder="Enter Label"
                            value={linkObj.label}
                            updateValue={(text: string) => {
                              const updatedLinks = [...addData.links];
                              updatedLinks[index].label = text;
                              handleAddTextChange(updatedLinks, "links");
                            }}
                          />
                          <Input
                            key={`link-${index}`}
                            context="Link URL"
                            placeholder="Enter URL"
                            value={linkObj.link}
                            updateValue={(text: string) => {
                              const updatedLinks = [...addData.links];
                              updatedLinks[index].link = text;
                              handleAddTextChange(updatedLinks, "links");
                            }}
                          />
                          {/* Remove Link Button */}
                          <Pressable
                            onPress={() => {
                              const updatedLinks = addData.links.filter(
                                (_, i) => i !== index
                              );
                              handleAddTextChange(updatedLinks, "links");
                            }}
                            style={styles.removeLinkButton}
                          >
                            <Text
                              style={{ color: "white", textAlign: "center" }}
                            >
                              Remove Link
                            </Text>
                          </Pressable>
                        </View>
                      ))
                    : updateData.links.map((linkObj, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                          <Input
                            key={`label-${index}`}
                            context="Link Label"
                            placeholder="Enter Label"
                            value={linkObj.label}
                            updateValue={(text: string) => {
                              const updatedLinks = [...updateData.links];
                              updatedLinks[index].label = text;
                              handleUpdateTextChange(updatedLinks, "links");
                            }}
                            isEditable={salesProductLinksEdit[index]}
                            setEditable={(value) =>
                              toggleEditable(index, value)
                            }
                          />
                          <Input
                            key={`link-${index}`}
                            context="Link URL"
                            placeholder="Enter URL"
                            value={linkObj.link}
                            updateValue={(text: string) => {
                              const updatedLinks = [...updateData.links];
                              updatedLinks[index].link = text;
                              handleUpdateTextChange(updatedLinks, "links");
                            }}
                            isEditable={salesProductLinksEdit[index]}
                            setEditable={(value) =>
                              toggleEditable(index, value)
                            }
                          />
                          {/* Remove Link Button */}
                          <Pressable
                            onPress={() => {
                              const updatedLinks = updateData.links.filter(
                                (_, i) => i !== index
                              );
                              handleUpdateTextChange(updatedLinks, "links");
                              const updatedEditState =
                                salesProductLinksEdit.filter(
                                  (_, i) => i !== index
                                );
                              setSalesProductLinksEdit(updatedEditState);
                            }}
                            style={styles.removeLinkButton}
                          >
                            <Text
                              style={{ color: "white", textAlign: "center" }}
                            >
                              Remove Link
                            </Text>
                          </Pressable>
                        </View>
                      ))}

                  {/* Add New Link Button */}
                  <Pressable
                    onPress={() => {
                      if (isAddForm) {
                        const updatedLinks = [
                          ...addData.links,
                          { label: "", link: "" },
                        ];
                        handleAddTextChange(updatedLinks, "links");
                      } else if (isEditForm) {
                        const updatedLinks = [
                          ...updateData.links,
                          { label: "", link: "" },
                        ];
                        handleUpdateTextChange(updatedLinks, "links");
                      }
                    }}
                    style={styles.addLinkButton}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      Add New Link
                    </Text>
                  </Pressable>
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
                    isAddForm
                      ? handleAddSalesProduct()
                      : handleUpdateSalesProduct()
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
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
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
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
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
  modalInfoLinkText: {
    fontSize: 16,
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

  linkTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  addLinkButton: {
    marginTop: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  removeLinkButton: {
    marginTop: 5,
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
});
