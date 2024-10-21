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
import { IRegistrationStoreProps } from "../Types/RegisterStoreScreenTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { SelectImages } from "../Components/Image";
import { IImageProps } from "../Types/ImageTypes";
import { IDocumentProps } from "../Types/DocumentTypes";
import { registerStore } from "../Middlewares/StoreMiddleware";
import { IResponseProps } from "../Types/ResponseTypes";
import { logoutUser } from "../Middlewares/AuthMiddleware";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/AuthContextTypes";

const screenWidth = Dimensions.get("screen").width;

export const RegisterStoreScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"RegisterStoreScreen">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { user } = useContext(User);
  const { auth, updateAccessToken, setAuth } = useContext(Auth);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [isModalVisible, setModalVisible] = useState(true);

  const defaultStoreRegisterFormData: IRegistrationStoreProps = {
    userId: user?._id || "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "store",
    storeImages: [],
    storeName: "",
    storeType: "",
    storeLocation: "",
    storeDocuments: [],
  };

  const [storeRegisterFormData, setStoreRegisterFormData] =
    useState<IRegistrationStoreProps>(defaultStoreRegisterFormData);
  // console.log(storeRegisterFormData);
  const [rejectedReason, setRejectedReason] = useState("");

  const handleRegisterStoreTextChange = (
    text: string,
    field: keyof IRegistrationStoreProps
  ) => {
    setStoreRegisterFormData({
      ...storeRegisterFormData,
      [field]: text,
    });
  };

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

  const [hidePassword, setHidePassword] = useState(true);
  const [hideCPassword, setHideCPassword] = useState(true);

  const handleRegisterStore = async () => {
    console.log("Register Store On Process");
    const response = await registerStore(
      auth,
      updateAccessToken,
      storeRegisterFormData
    );

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

  const [isReviewRegisterStore, setIsReviewRegisterStore] = useState(false);

  useEffect(() => {
    if (route.params && route.params.data && route.params.reason) {
      setStoreRegisterFormData(route.params.data);
      setIsReviewRegisterStore(true);
      setModalVisible(false);
      setRejectedReason(route.params.reason);
    } else {
      setStoreRegisterFormData(defaultStoreRegisterFormData);
    }
  }, []);

  const handleOpenDocument = (file: string, name: string) => {
    navigation.navigate("DocumentDetailsScreen", {
      documentUri: file,
      fileName: name,
    });
  };

  const goToRegisterStore = () => {
    setModalVisible(true);
    setIsReviewRegisterStore(false);
    setStoreRegisterFormData(defaultStoreRegisterFormData);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      {/* Modal for Information */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
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
              onPress={() => setModalVisible(false)}
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
                  Join With Cuts & Expands Your Store
                </Text>

                {/* Information Button */}
                <Pressable onPress={() => setModalVisible(true)}>
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
                  <Input
                    key="registerStoreType"
                    context="Type"
                    placeholder="Enter Store Type(Salon / Barbershop)"
                    value={storeRegisterFormData.storeType}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeType")
                    }
                    iconName="scissors"
                    iconSource="Fontisto"
                  />
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
                  {/* Store Location Input */}
                  <Input
                    key="registerStoreLocation"
                    context="Location"
                    placeholder="Enter Store Location"
                    value={storeRegisterFormData.storeLocation}
                    updateValue={(text: string) =>
                      handleRegisterStoreTextChange(text, "storeLocation")
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
                <Pressable onPress={() => setModalVisible(true)}>
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
                          <View key={index} style={styles.imageItemContainer}>
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
                        ))}
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
                  {/* Little Text */}
                  <Text style={[styles.text2, { color: activeColors.accent }]}>
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
                      style={[styles.reason, { color: activeColors.accent }]}
                      numberOfLines={100}
                    >
                      {rejectedReason}
                    </Text>
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
                  {/* Register Button */}
                  <Pressable onPress={goToRegisterStore}>
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
                      Register A New Store
                    </Text>
                  </Pressable>
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
    width: "75%",
    padding: 30,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
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
    marginBottom: 5,
  },
  inputContainer: {
    flex: 1,
    alignItems: "center",
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
