import React, { useContext, useEffect, useState } from "react";

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
  ActivityIndicator,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import {
  addStorePromotion,
  deleteStorePromotionById,
  updateStorePromotion,
} from "../../Middlewares/StoreMiddleware/StorePromotionMiddleware";
import { apiCallHandler } from "../../Middlewares/util";
import {
  AddStorePromotionData,
  UpdateStorePromotionData,
} from "../../Types/StoreTypes/StorePromotionTypes";
import { set } from "mongoose";
import { SelectSingleImage } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { Input } from "../../Components/Input";
import { DateTimePickerComponent } from "../../Components/DateTimePicker";

const screenWidth = Dimensions.get("screen").width;

export const StorePromotionScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StorePromotions">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const [loading, setLoading] = useState(false);

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

  const dateFormatForDateTimePicker = (date: Date | null) => {
    if (!date) {
      return "";
    }

    const validDate = date instanceof Date ? true : false;
    if (!validDate) {
      return dateFormat(date);
    }

    return (
      date.toISOString().split("T")[0] +
      " " +
      date.toISOString().split("T")[1].split(".")[0]
    );
  };

  const handleDeleteStorePromotion = async (storePromotionId: string) => {
    setLoading(true);
    const response = await apiCallHandler({
      apiCall: () =>
        deleteStorePromotionById({
          auth,
          updateAccessToken,
          params: {
            storePromotionId,
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

  const defaultAddData: AddStorePromotionData = {
    name: "",
    image: {
      file: "",
    },
    startDate: null,
    endDate: null,
  };

  const [addData, setAddData] = useState(defaultAddData);
  console.log("addPromotionData", addData);

  const handleAddTextChange = <T extends keyof AddStorePromotionData>(
    value: AddStorePromotionData[T],
    fieldname: T
  ) => {
    setAddData({
      ...addData,
      [fieldname]: value,
    });
  };

  const handleAddStorePromotion = async () => {
    setLoading(true);
    const response = await apiCallHandler({
      apiCall: () =>
        addStorePromotion({
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

  const defaultUpdateData: UpdateStorePromotionData = {
    promotionId: "",
    name: "",
    image: {
      file: "",
    },
    startDate: null,
    endDate: null,
  };

  const [updateData, setUpdateData] = useState(defaultUpdateData);
  console.log("updatePromotionData", updateData);

  const handleUpdateTextChange = <T extends keyof UpdateStorePromotionData>(
    value: UpdateStorePromotionData[T],
    fieldname: T
  ) => {
    setUpdateData({
      ...updateData,
      [fieldname]: value,
    });
  };

  const [storePromotionNameEdit, setStorePromotionNameEdit] = useState(false);

  const handleSetEditData = (storePromotionId: string) => {
    const currentData: UpdateStorePromotionData = {
      promotionId: storePromotionId,
      name:
        store.storePromotions.find(
          (storePromotion) => storePromotion._id === storePromotionId
        )?.name ?? "",
      startDate:
        store.storePromotions.find(
          (storePromotion) => storePromotion._id === storePromotionId
        )?.startDate ?? null,
      endDate:
        store.storePromotions.find(
          (storePromotion) => storePromotion._id === storePromotionId
        )?.endDate ?? null,
      image: store.storePromotions.find(
        (storePromotion) => storePromotion._id === storePromotionId
      )?.image ?? { file: "" },
    };
    console.log("forEditData", currentData);
    setUpdateData(currentData);
    setIsEditForm(true);
  };

  const handleUpdateStorePromotion = async () => {
    setLoading(true);
    const response = await apiCallHandler({
      apiCall: () =>
        updateStorePromotion({
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
      setStorePromotionNameEdit(false);
      setIsEditForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
    setLoading(false);
  };

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
              Store Promotion
            </Text>
            {/* add storePromotion button*/}
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
            {store.storePromotions.map((storePromotion) => (
              <ImageBackground
                key={storePromotion._id}
                source={{ uri: storePromotion.image.file }} // Replace with your image URL
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
                    {storePromotion.name}
                  </Text>
                  <Text
                    style={[
                      styles.startEndText,
                      { color: activeColors.accent },
                    ]}
                  >
                    Start: {dateFormat(storePromotion.startDate)}
                  </Text>
                  <Text
                    style={[
                      styles.startEndText,
                      { color: activeColors.accent },
                    ]}
                  >
                    End: {dateFormat(storePromotion.endDate)}
                  </Text>
                </View>

                {/* Delete Icon */}
                <Pressable
                  style={styles.deleteContainer}
                  onPress={() =>
                    Alert.alert(
                      `Are you sure want to delete '${storePromotion.name}' promo?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteStorePromotion(
                              storePromotion._id ?? ""
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
                    handleSetEditData(storePromotion._id ?? "");
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
        </>
      ) : (
        <>
          <Header
            goBack={() => {
              isAddForm
                ? (setIsAddForm(false), setAddData(defaultAddData))
                : (setIsEditForm(false),
                  setUpdateData(defaultUpdateData),
                  setStorePromotionNameEdit(false));
            }}
          />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              {isAddForm
                ? "Add Store Promotion Form"
                : "Edit Store Promotion Form"}
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

          {/* form store promotion */}
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
                  key="storePromotionPromo"
                  context="Promotion"
                  placeholder="Enter Store Promotion"
                  value={isEditForm ? updateData.name : addData.name || ""}
                  updateValue={(text: string) =>
                    isEditForm
                      ? handleUpdateTextChange(text, "name")
                      : handleAddTextChange(text, "name")
                  }
                  isEditable={isEditForm ? storePromotionNameEdit : undefined}
                  setEditable={
                    isEditForm ? setStorePromotionNameEdit : undefined
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

                {/* Start Date */}
                <Text
                  style={[styles.startEndText, { color: activeColors.accent }]}
                >
                  Start Date:{" "}
                  {isAddForm
                    ? dateFormatForDateTimePicker(addData.startDate)
                    : dateFormatForDateTimePicker(updateData.startDate)}
                </Text>

                <View style={styles.dateTimePickerContainer}>
                  <DateTimePickerComponent
                    onPress={(value: Date) => {
                      isAddForm
                        ? handleAddTextChange(
                            new Date(value.getTime() + 7 * 60 * 60 * 1000),
                            "startDate"
                          )
                        : handleUpdateTextChange(
                            new Date(value.getTime() + 7 * 60 * 60 * 1000),
                            "startDate"
                          );
                    }}
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

                {/* End Date */}
                <Text
                  style={[styles.startEndText, { color: activeColors.accent }]}
                >
                  End Date:{" "}
                  {isAddForm
                    ? dateFormatForDateTimePicker(addData.endDate)
                    : dateFormatForDateTimePicker(updateData.endDate)}
                </Text>

                <View style={styles.dateTimePickerContainer}>
                  <DateTimePickerComponent
                    onPress={(value: Date) => {
                      isAddForm
                        ? handleAddTextChange(
                            new Date(value.getTime() + 7 * 60 * 60 * 1000),
                            "endDate"
                          )
                        : handleUpdateTextChange(
                            new Date(value.getTime() + 7 * 60 * 60 * 1000),
                            "endDate"
                          );
                    }}
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
                      ? handleAddStorePromotion()
                      : handleUpdateStorePromotion()
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
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
  },
  card: {
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 150,
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
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 40,
  },
  startEndText: {
    fontSize: 17,
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
  dateTimePickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 50,
    paddingHorizontal: 50,
  },
});
