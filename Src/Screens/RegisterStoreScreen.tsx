import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Auth, Theme, User } from "../Contexts";
import { colors } from "../Config/Theme";
import { Header } from "../Components/Header";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { Input } from "../Components/Input";
import { SelectDocuments } from "../Components/Documents";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { SelectImages } from "../Components/Image";
import { IImageProps } from "../Types/ComponentTypes/ImageTypes";
import { IDocumentProps } from "../Types/ComponentTypes/DocumentTypes";
import {
  approveStore,
  deleteStore,
  holdStore,
  registerStore,
  rejectStore,
  unHoldStore,
} from "../Middlewares/StoreMiddleware/StoreMiddleware";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import ImageViewing from "react-native-image-viewing";
import { DropdownPicker } from "../Components/DropdownPicker";
import {
  DeleteStoreData,
  RegistrationStoreData
} from "../Types/StoreTypes/StoreTypes";
import { logoutUser } from "../Middlewares/UserMiddleware";

import { extractLatLng } from "../../Server/Utils/LocationUtils";

import { Coordinates, Location } from "../Types/StoreTypes/StoreTypes";

const screenWidth = Dimensions.get("screen").width;

export const RegisterStoreScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"RegisterStoreScreen">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { user } = useContext(User);
  const { auth, updateAccessToken, setAuth } = useContext(Auth);

  const [isReviewRegisterStore, setIsReviewRegisterStore] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const defaultLocation: Location = {
    name: null,
    coordinates: null
  }

  const [locationName, setLocationName] = useState(String);
  const [locationCoord, setLocationCoord] = useState<Coordinates>();

  //Data
  const defaultStoreRegisterFormData: RegistrationStoreData = {
    userId: user?._id || "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "store",
    storeImages: [],
    storeName: "",
    storeType: "",
    storeLocation: defaultLocation,
    storeDocuments: [],
  };
  const [storeRegisterFormData, setStoreRegisterFormData] =
    useState<RegistrationStoreData>(defaultStoreRegisterFormData);
  console.log(storeRegisterFormData);
  const [reason, setReason] = useState("");

  const [status, setStatus] = useState("");
  const [storeId, setStoreId] = useState("");

  //Modal Information Register Store
  const [isModalVisible, setIsModalVisible] = useState(true);

  //Register Store (user)
  const [hidePassword, setHidePassword] = useState(true);
  const [hideCPassword, setHideCPassword] = useState(true);
  const handleRegisterStoreTextChange = (
    text: string,
    field: keyof RegistrationStoreData
  ) => {
    setStoreRegisterFormData({
      ...storeRegisterFormData,
      [field]: text,
    });
  };
  const typeOptions = [
    { label: "Salon", value: "salon" },
    { label: "Barbershop", value: "barbershop" },
  ];

  const handleChangeLocationName = (text: string) => {
    setLocationName(text)

    const tempLocation: Location = {
      address: locationName,
      coordinates: locationCoord
    }

    setStoreRegisterFormData({
      ...storeRegisterFormData,
      storeLocation: tempLocation
    })
  }

  const handleChangeLocationCoord = (text: string) => {
    const hasGoogle = text.includes("https://www.google.com/maps");

    if (text !== null && text !== undefined && text.trim() !== '' && hasGoogle) {
      const extractedLatLon = extractLatLng(text);

      const tempCoord: Coordinates = extractedLatLon

      setLocationCoord(tempCoord)

      const tempLocation: Location = {
        address: locationName,
        coordinates: locationCoord
      }

      if (extractedLatLon != null){
        setStoreRegisterFormData({
          ...storeRegisterFormData,
          storeLocation: tempLocation
        })
      }
    }
  }

  const handleChangeImages = (images: IImageProps[]) => {
    setStoreRegisterFormData({
      ...storeRegisterFormData,
      storeImages: images,
    });
  };
  const handleChangeDocuments = (documents: IDocumentProps[]) => {
    setStoreRegisterFormData({
      ...storeRegisterFormData,
      storeDocuments: documents,
    });
  };
  const handleRegisterStore = async () => {
    console.log("Register Store On Process");
    const response = await registerStore({
      auth,
      updateAccessToken,  
      data: storeRegisterFormData,
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setStoreRegisterFormData(defaultStoreRegisterFormData);
      navigation.navigate("TabsStack", { screen: "Settings" });
    } else {
      Alert.alert("Registration Store error", response.message);
    }
  };

  //Utils
  //Document Detail
  const handleOpenDocument = (file: string, name: string) => {
    navigation.navigate("DocumentDetailsScreen", {
      documentUri: file,
      fileName: name,
    });
  };
  //Image Viewer
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = storeRegisterFormData.storeImages.map((image) => ({
    uri: image.file,
  }));
  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  //Finish Review (user)
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [hideDeletePassword, setHideDeletePassword] = useState(true);
  const defaultDeleteStoreFormData: DeleteStoreData = {
    email: "",
    password: "",
  };
  const [deleteStoreFormData, setDeleteStoreFormData] =
    useState<DeleteStoreData>(defaultDeleteStoreFormData);
  // console.log("deleteFormData", deleteStoreFormData);
  const handleDeleteStoreTextChange = (text: string, fieldname: string) => {
    setDeleteStoreFormData({ ...deleteStoreFormData, [fieldname]: text });
  };
  const handleFinishedReviewing = async () => {
    console.log("Done Review Process");
    const response = await deleteStore({
      auth,
      updateAccessToken,
      data: deleteStoreFormData,
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);

      navigation.navigate("TabsStack", { screen: "Settings" });
    } else {
      Alert.alert("Deletion error", response.message);
    }
  };

  //Approve Store (admin)
  const handleApproveStore = async () => {
    console.log("Approve Store");
    const response = await approveStore({
      auth,
      updateAccessToken,
      params: { storeId },
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      // setTimeout(() => {
      //   navigation.navigate("TabsStack", { screen: "StoreManagement" });
      // }, 500);
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1, // Index 1 means "StoreManagement" is the focused screen, with "Home" below it in the stack
            routes: [
              { name: "TabsStack", params: { screen: "Home" } }, // Set Home as the first screen
              { name: "TabsStack", params: { screen: "StoreManagement" } }, // Set StoreManagement as the second screen
            ],
          })
        );
      }, 500);
    } else {
      Alert.alert("Approval Store Error", response.message);
    }
  };

  //Reject Store (admin)
  const [isModalReasonVisible, setIsModalReasonVisible] = useState(false);
  const handleReasonTextChange = (text: string) => {
    // Split the text into lines and add the "- " prefix for each line
    const formattedText = text
      .split("\n") // Split the text by new line
      .map((line) => (line.startsWith("- ") ? line : `- ${line}`)) // Add the "- " prefix if not already present
      .join("\n"); // Join the lines back into a single string

    setReason(formattedText); // Set the updated text
  };
  const handleRejectStore = async () => {
    console.log("Reject Store");
    const response = await rejectStore({
      auth,
      updateAccessToken,
      data: {
        storeId,
        rejectedReason: reason,
      },
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1, // Index 1 means "StoreManagement" is the focused screen, with "Home" below it in the stack
            routes: [
              { name: "TabsStack", params: { screen: "Home" } }, // Set Home as the first screen
              { name: "TabsStack", params: { screen: "StoreManagement" } }, // Set StoreManagement as the second screen
            ],
          })
        );
      }, 500);
    } else {
      Alert.alert("Reject Store Error", response.message);
    }
  };

  //Hold Store (admin)
  const [isHold, setIsHold] = useState(false);
  const handleHoldStore = async () => {
    console.log("Hold Store");
    const response = await holdStore({
      auth,
      updateAccessToken,
      data: {
        storeId,
        onHoldReason: reason,
      },
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",  
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1, // Index 1 means "StoreManagement" is the focused screen, with "Home" below it in the stack
            routes: [
              { name: "TabsStack", params: { screen: "Home" } }, // Set Home as the first screen
              { name: "TabsStack", params: { screen: "StoreManagement" } }, // Set StoreManagement as the second screen
            ],
          })
        );
      }, 500);
    } else {
      Alert.alert("Hold Store Error", response.message);
    }
  };

  //Unhold Store (admin)
  const handleUnHoldStore = async () => {
    console.log("Unhold Store");
    const response = await unHoldStore({
      auth,
      updateAccessToken,
      params: { storeId },
    });

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1, // Index 1 means "StoreManagement" is the focused screen, with "Home" below it in the stack
            routes: [
              { name: "TabsStack", params: { screen: "Home" } }, // Set Home as the first screen
              { name: "TabsStack", params: { screen: "StoreManagement" } }, // Set StoreManagement as the second screen
            ],
          })
        );
      }, 500);
    } else {
      Alert.alert("UnHold Store Error", response.message);
    }
  };

  useEffect(() => {
    if (route.params && route.params.data) {
      setStoreRegisterFormData(route.params.data);
      handleDeleteStoreTextChange(route.params.data.email, "email");
      setIsReviewRegisterStore(true);
      setIsModalVisible(false);
      if (route.params.reason) setReason(route.params.reason);
      if (route.params.status) setStatus(route.params.status);
      if (route.params.storeId) setStoreId(route.params.storeId);
    } else {
      setStoreRegisterFormData(defaultStoreRegisterFormData);
    }
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      {/* Modal for Information */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
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
              Store Registration Information
            </Text>
            {/* Content */}
            {/* Things to do */}
            <Text
              style={[
                styles.modalSubTitleText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Things to do:
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>Input</Text> all the field
              information about your store {"\n"}•{" "}
              <Text style={{ fontWeight: "bold" }}>Upload</Text> Images &
              Documents about your store {"\n"}
            </Text>

            {/* Status Registration */}
            <Text
              style={[
                styles.modalSubTitleText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Store Statuses:
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              •{" "}
              <Text style={{ fontWeight: "bold" }}>Awaiting for Approval</Text>{" "}
              (Admin is validating your store data)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>Rejected</Text> (Admin
              rejected your store registration, you can modify and resubmit)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>Active</Text> (Store can be
              seen publicly)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>InActive</Text> (Store is
              still private)
            </Text>
            {/* Close Button */}
            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for reason (reject & hold store) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalReasonVisible}
        onRequestClose={() => {
          setIsModalReasonVisible(false);
          setIsHold(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer2,
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
              {isHold === true ? "Hold Store" : "Reject Store"}
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
              onPress={isHold === true ? handleHoldStore : handleRejectStore}
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
                setIsModalReasonVisible(false);
                setIsHold(false);
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for finish review proses for user to input Password for delete store */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalDeleteVisible}
        onRequestClose={() => {
          setIsModalDeleteVisible(false);
          setHideDeletePassword(true);
          setDeleteStoreFormData(defaultDeleteStoreFormData);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer2,
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
              Delete Store
            </Text>

            {/* Inputs */}
            <View>
              {/* Password Input */}
              <Input
                key="inputPassword"
                context="Store Password"
                isHidden={hideDeletePassword}
                setHidden={setHideDeletePassword}
                placeholder="Enter Store Password"
                value={deleteStoreFormData.password}
                updateValue={(text: string) =>
                  handleDeleteStoreTextChange(text, "password")
                }
                iconName="lock"
                iconSource="Octicons"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.modalSubmitButton,
                {
                  backgroundColor: activeColors.accent,
                  width: (screenWidth * 2) / 3 + 50,
                },
              ]}
              onPress={handleFinishedReviewing}
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
                setIsModalDeleteVisible(false);
                setHideDeletePassword(true);
                setDeleteStoreFormData(defaultDeleteStoreFormData);
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Header goBack={handleGoBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.registerContainer]}
        // iOS: padding menggeser konten ke atas tanpa mengubah tinggi kontainer.
        // Android: height mengurangi tinggi kontainer untuk menghindari tumpang tindih dengan keyboard.
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: screenWidth }}
        >
          <View style={styles.registerScrollContainer}>
            {isReviewRegisterStore !== true ? (
              <>
                {/* Title */}
                <Text style={[styles.title, { color: activeColors.accent }]}>
                  Join Cuts and Expand Your Store
                </Text>

                {/* Information Button */}
                <Pressable onPress={() => setIsModalVisible(true)}>
                  <Text
                    style={[
                      styles.informationButton,
                      {
                        color: activeColors.tertiary,
                      },
                    ]}
                  >
                    About Store Registration{" "}
                    <Text style={{ color: activeColors.accent }}>
                      Read here
                    </Text>
                  </Text>
                </Pressable>

                {/* Break Line */}
                <View
                  style={{
                    marginTop: 10,
                    borderWidth: 1,
                    backgroundColor: activeColors.secondary,
                    borderColor: activeColors.secondary,
                    width: "100%",
                  }}
                ></View>

                {/* Little Text */}
                <Text style={[styles.text, { color: activeColors.accent }]}>
                  Fill the form below to Register
                </Text>

                {/* Inputs */}
                <View style={styles.inputContainer}>
                  {/* Store Name Input */}
                  <Input
                    key="registerStoreName"
                    context="Name"
                    placeholder="Enter Store Name"
                    value={storeRegisterFormData.storeName}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeName")
                    }
                    iconName="shopping-store"
                    iconSource="Fontisto"
                  />

                  {/* Email Input */}
                  <Input
                    key="registerStoreEmail"
                    context="Store Email"
                    placeholder="Enter Store Email"
                    value={storeRegisterFormData.email}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "email")
                    }
                    iconName="email-outline"
                    iconSource="MaterialCommunityIcons"
                  />
                  {/* Password Input */}
                  <Input
                    key="registerStorePassword"
                    context="Store Password"
                    isHidden={hidePassword}
                    setHidden={setHidePassword}
                    placeholder="Enter Store Password"
                    value={
                      storeRegisterFormData.password
                        ? storeRegisterFormData.password
                        : ""
                    }
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "password")
                    }
                    iconName="lock"
                    iconSource="Octicons"
                  />
                  {/* Confirm Password Input */}
                  <Input
                    key="registerStoreConfirmPassword"
                    context="Confirm Password"
                    isHidden={hideCPassword}
                    setHidden={setHideCPassword}
                    placeholder="Enter Store Confirm Password"
                    value={
                      storeRegisterFormData.confirmPassword
                        ? storeRegisterFormData.confirmPassword
                        : ""
                    }
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "confirmPassword")
                    }
                    iconName="lock"
                    iconSource="Octicons"
                  />
                  {/* Store Type Input */}
                  {/* <Input
                    key="registerStoreType"
                    context="Type"
                    placeholder="Enter Store Type(Salon / Barbershop)"
                    value={storeRegisterFormData.storeType}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeType")
                    }
                    iconName="scissors"
                    iconSource="Fontisto"
                  /> */}
                  <View style={styles.typeInputContainer}>
                    <DropdownPicker
                      key={"registerStoreType"}
                      options={typeOptions}
                      selectedValue={storeRegisterFormData.storeType}
                      onValueChange={(text: string) =>
                        handleRegisterStoreTextChange(text, "storeType")
                      }
                      placeHolder="Select Store Type..."
                      iconName="scissors"
                      iconSource="Fontisto"
                      isInput={true}
                      context="Type"
                    />
                  </View>

                  {/* Store Location Input */}
                  <Input
                    key="registerStoreLocationName"
                    context="Location"
                    placeholder="Enter Store Location"
                    value={locationName}
                    updateValue={(text: string) =>
                      handleChangeLocationName(text)
                    }
                    iconName="location"
                    iconSource="EvilIcons"
                  />
                  <Input
                    key="registerStoreLocationCoord"
                    context="Location"
                    placeholder="Enter Google Maps Link"
                    value={locationCoord}
                    updateValue={(text: string) =>
                      handleChangeLocationCoord(text)
                    }
                    iconName="location"
                    iconSource="EvilIcons"
                  />
                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>
                  <SelectImages handleSetImages={handleChangeImages} />
                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>
                  <SelectDocuments handleSetDocument={handleChangeDocuments} />
                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>
                </View>

                {/* Register Button */}
                <Pressable onPress={handleRegisterStore}>
                  <Text
                    style={[
                      styles.registerButtonContainer,
                      {
                        color: activeColors.secondary,
                        backgroundColor: activeColors.accent,
                        width: (screenWidth * 2) / 3 + 50,
                      },
                    ]}
                  >
                    Register
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Title */}
                <Text style={[styles.title, { color: activeColors.accent }]}>
                  Store Review
                </Text>

                {/* Information Button */}
                <Pressable onPress={() => setIsModalVisible(true)}>
                  <Text
                    style={[
                      styles.informationButton,
                      {
                        color: activeColors.tertiary,
                      },
                    ]}
                  >
                    About Store Registration{" "}
                    <Text style={{ color: activeColors.accent }}>
                      Read here
                    </Text>
                  </Text>
                </Pressable>

                {/* Break Line */}
                <View
                  style={{
                    marginTop: 10,
                    borderWidth: 1,
                    backgroundColor: activeColors.secondary,
                    borderColor: activeColors.secondary,
                    width: "100%",
                  }}
                ></View>

                {/* Little Text */}
                <Text style={[styles.text, { color: activeColors.accent }]}>
                  Store Infomation
                </Text>

                {/* Inputs */}
                <View style={styles.inputContainer}>
                  {/* Email Input */}
                  <Input
                    key="registerStoreReviewEmail"
                    context="Store Email"
                    placeholder="Enter Store Email"
                    value={storeRegisterFormData.email}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "email")
                    }
                    iconName="email-outline"
                    iconSource="MaterialCommunityIcons"
                    isDisabled={true}
                  />
                  {/* Store Type Input */}
                  <Input
                    key="registerStoreReviewType"
                    context="Type"
                    placeholder="Enter Store Type(Salon / Barbershop)"
                    value={storeRegisterFormData.storeType}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeType")
                    }
                    iconName="scissors"
                    iconSource="Fontisto"
                    isDisabled={true}
                  />
                  {/* Store Name Input */}
                  <Input
                    key="registerStoreReviewName"
                    context="Name"
                    placeholder="Enter Store Name"
                    value={storeRegisterFormData.storeName}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeName")
                    }
                    iconName="shopping-store"
                    iconSource="Fontisto"
                    isDisabled={true}
                  />
                  {/* Store Location Input */}
                  <Input
                    key="registerStoreReviewLocation"
                    context="Location"
                    placeholder="Enter Store Location"
                    value={storeRegisterFormData.storeLocation}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeLocation")
                    }
                    iconName="location"
                    iconSource="EvilIcons"
                    isDisabled={true}
                  />

                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>
                  {/* Little Text */}
                  <Text style={[styles.text2, { color: activeColors.accent }]}>
                    Store Images
                  </Text>
                  <View style={styles.imageContainer}>
                    {storeRegisterFormData.storeImages.length > 0 && (
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageList}
                      >
                        {storeRegisterFormData.storeImages.map((uri, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleImagePress(index)}
                          >
                            <View style={styles.imageItemContainer}>
                              <Image
                                source={{
                                  uri: storeRegisterFormData.storeImages[index]
                                    .file,
                                }}
                                style={[
                                  styles.imageItem,
                                  { borderColor: activeColors.tertiary },
                                ]}
                              />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  {/* Fullscreen Image Viewer */}
                  <ImageViewing
                    images={images}
                    imageIndex={selectedImageIndex}
                    visible={isImageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                  />

                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>
                  {/* Little Text */}
                  <Text style={[styles.text2, { color: activeColors.accent }]}>
                    Store Documents
                  </Text>
                  <View style={styles.documentContainer}>
                    {storeRegisterFormData.storeDocuments.length > 0 && (
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.documentList}
                      >
                        {storeRegisterFormData.storeDocuments.map(
                          (document, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                handleOpenDocument(
                                  storeRegisterFormData.storeDocuments[index]
                                    .file,
                                  storeRegisterFormData.storeDocuments[index]
                                    .name
                                )
                              } // Open document on click
                              style={[
                                styles.documentItemContainer,
                                { borderColor: activeColors.accent },
                              ]}
                            >
                              {/* PDF Icon */}
                              <FontAwesome6
                                name={"file-pdf"}
                                size={30}
                                color={activeColors.tertiary}
                              />
                              {/* Document Name */}
                              <Text
                                style={{
                                  color: activeColors.accent,
                                  fontSize: 12,
                                  paddingLeft: 10,
                                }}
                              >
                                {document.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </ScrollView>
                    )}
                  </View>

                  {/* Break Line */}
                  <View
                    style={{
                      marginVertical: 10,
                      borderWidth: 1,
                      backgroundColor: activeColors.secondary,
                      borderColor: activeColors.secondary,
                      width: "100%",
                    }}
                  ></View>

                  {/* Waiting for Approval */}
                  {status === "Waiting for Approval" && (
                    <>
                      {/* Approve */}
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            "Confirmation",
                            "Are you sure you want to APPROVE this store?",
                            [
                              { text: "Yes", onPress: handleApproveStore },
                              { text: "No" },
                            ],
                            { cancelable: true }
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.registerButtonContainer,
                            {
                              color: activeColors.secondary,
                              backgroundColor: activeColors.accent,
                              width: (screenWidth * 2) / 3 + 50,
                            },
                          ]}
                        >
                          Approve Store
                        </Text>
                      </Pressable>

                      {/* Reject */}
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            "Confirmation",
                            "Are you sure you want to REJECT this store?",
                            [
                              {
                                text: "Yes",
                                onPress: () => setIsModalReasonVisible(true),
                              },
                              { text: "No" },
                            ],
                            { cancelable: true }
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.registerButtonContainer,
                            {
                              color: activeColors.secondary,
                              backgroundColor: activeColors.accent,
                              width: (screenWidth * 2) / 3 + 50,
                            },
                          ]}
                        >
                          Reject Store
                        </Text>
                      </Pressable>
                    </>
                  )}
                  {/* Approved */}
                  {(status === "InActive" || status === "Active") && (
                    <>
                      {/* Hold */}
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            "Confirmation",
                            "Are you sure you want to HOLD this store?",
                            [
                              {
                                text: "Yes",
                                onPress: () => {
                                  setIsModalReasonVisible(true);
                                  setIsHold(true);
                                },
                              },
                              { text: "No" },
                            ],
                            { cancelable: true }
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.registerButtonContainer,
                            {
                              color: activeColors.secondary,
                              backgroundColor: activeColors.accent,
                              width: (screenWidth * 2) / 3 + 50,
                            },
                          ]}
                        >
                          Hold Store
                        </Text>
                      </Pressable>
                    </>
                  )}
                  {/* Hold */}
                  {status === "Hold" && (
                    <>
                      {user.role === "admin" && (
                        <>
                          {/* UnHold */}
                          <Pressable
                            onPress={() =>
                              Alert.alert(
                                "Confirmation",
                                "Are you sure you want to UNHOLD this store?",
                                [
                                  {
                                    text: "Yes",
                                    onPress: () => handleUnHoldStore(),
                                  },
                                  { text: "No" },
                                ],
                                { cancelable: true }
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.registerButtonContainer,
                                {
                                  color: activeColors.secondary,
                                  backgroundColor: activeColors.accent,
                                  width: (screenWidth * 2) / 3 + 50,
                                },
                              ]}
                            >
                              UnHold Store
                            </Text>
                          </Pressable>
                        </>
                      )}

                      {user.role === "user" && (
                        <>
                          {/* Little Text */}
                          <Text
                            style={[
                              styles.text2,
                              { color: activeColors.accent },
                            ]}
                          >
                            Hold Reasons
                          </Text>

                          <View
                            style={[
                              styles.reasonContainer,
                              {
                                backgroundColor: activeColors.secondary,
                                borderColor: activeColors.tertiary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.reason,
                                { color: activeColors.accent },
                              ]}
                              numberOfLines={100}
                            >
                              {reason}
                            </Text>
                          </View>
                        </>
                      )}
                    </>
                  )}
                  {/* Rejected */}
                  {status === "Rejected" && (
                    <>
                      {/* Little Text */}
                      <Text
                        style={[styles.text2, { color: activeColors.accent }]}
                      >
                        Rejected Reasons
                      </Text>

                      <View
                        style={[
                          styles.reasonContainer,
                          {
                            backgroundColor: activeColors.secondary,
                            borderColor: activeColors.tertiary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.reason,
                            { color: activeColors.accent },
                          ]}
                          numberOfLines={100}
                        >
                          {reason}
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Done Review Button */}
                  {user.role === "user" && status === "Rejected" && (
                    <>
                      {/* Break Line */}
                      <View
                        style={{
                          marginVertical: 10,
                          borderWidth: 1,
                          backgroundColor: activeColors.secondary,
                          borderColor: activeColors.secondary,
                          width: "100%",
                        }}
                      ></View>

                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            "Have you reviewed the store?",
                            `Press YES and System will ask for the store password for deletion process so you can make a new store with the same email.`,
                            [
                              {
                                text: "Yes",
                                onPress: () => setIsModalDeleteVisible(true),
                              },
                              { text: "No" },
                            ],
                            { cancelable: true }
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.registerButtonContainer,
                            {
                              color: activeColors.secondary,
                              backgroundColor: activeColors.accent,
                              width: (screenWidth * 2) / 3 + 50,
                            },
                          ]}
                        >
                          Finish Review
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 30,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalContainer2: {
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
  modalSubTitleText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "400",
    textAlign: "left",
  },
  modalContentText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "200",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
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

  registerContainer: {
    flex: 1,
  },
  registerScrollContainer: {
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    fontWeight: "600",
    marginTop: 20,
    alignSelf: "center",
  },
  informationButton: {
    fontSize: 13,
    marginTop: 5,
    alignSelf: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    alignSelf: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    alignItems: "center",
  },
  typeInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 99,
    marginVertical: 10,
  },

  registerButtonContainer: {
    paddingVertical: 12,
    borderRadius: 50,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    alignSelf: "center",
  },

  text2: {
    fontSize: 20,
    fontWeight: "500",
    alignSelf: "center",
    marginBottom: 10,
  },

  imageContainer: {
    marginBottom: 10,
    width: (screenWidth * 2) / 3 + 50,
  },
  imageList: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageItemContainer: {
    marginHorizontal: 5,
  },
  imageItem: {
    borderRadius: 5,
    width: 80,
    height: 80,
    borderWidth: 1,
  },

  documentContainer: {
    marginBottom: 10,
    width: (screenWidth * 2) / 3 + 50,
  },
  documentList: {
    flexDirection: "column",
    justifyContent: "center",
  },
  documentItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
  },

  reasonContainer: {
    width: (screenWidth * 2) / 3 + 50,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  reason: {
    fontSize: 15,
    fontWeight: "400",
  },
});
