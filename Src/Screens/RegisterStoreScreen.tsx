import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Auth, Theme, User } from "../Contexts";
import { colors } from "../Config/Theme";
import { Header } from "../Components/Header";
import { AntDesign } from "@expo/vector-icons";
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

export const RegisterStoreScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"RegisterStoreScreen">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { user } = useContext(User);
  const { auth, updateAccessToken, setAuth } = useContext(Auth);

  const screenWidth = Dimensions.get("screen").width;

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
  console.log(storeRegisterFormData);
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

  useEffect(() => {
    setStoreRegisterFormData(defaultStoreRegisterFormData);
  }, []);
  useFocusEffect(
    useCallback(() => {
      setStoreRegisterFormData(defaultStoreRegisterFormData);
    }, [])
  );

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
              • Input all the required information about your store {"\n"}
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
                <Text style={{ color: activeColors.accent }}>Read here</Text>
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
                context="Email"
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
                context="Password"
                isHidden={hidePassword}
                setHidden={setHidePassword}
                placeholder="Enter Store Password"
                value={storeRegisterFormData.password}
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
                value={storeRegisterFormData.confirmPassword}
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
});
