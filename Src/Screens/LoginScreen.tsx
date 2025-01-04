import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Header } from "../Components/Header";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { colors } from "../Config/Theme";
import { Input } from "../Components/Input";
import { Logo } from "../Components/Logo";
import { Theme } from "../Contexts/ThemeContext";
import { Auth } from "../Contexts/AuthContext";
import { IResponseProps, LoginResponse } from "../Types/ResponseTypes";
import { useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { LoginData } from "../Types/UserTypes";
import { changeUserPassword, loginUser } from "../Middlewares/UserMiddleware";

export const LoginScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"LoginScreen">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const screenHeight = Dimensions.get("screen").height;
  const screenWidth = Dimensions.get("screen").width;

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const defaultUserLoginFormData: LoginData = {
    email: "",
    password: "",
  };
  const [userLoginFormData, setUserLoginFormData] = useState<LoginData>(
    defaultUserLoginFormData
  );
  const handleLoginTextChange = (text: string, fieldname: string) => {
    setUserLoginFormData({ ...userLoginFormData, [fieldname]: text });
  };

  const [hidePassword, setHidePassword] = useState(true);

  const { auth, setAuth } = useContext(Auth);

  const handleLogin = async () => {
    // console.log("Login Process");
    setLoading(true);

    const result: IResponseProps<LoginResponse> = await loginUser(
      userLoginFormData
    );
    console.log(JSON.stringify(result, null, 2));

    if (result.status >= 200 && result.status < 400) {
      Keyboard.dismiss();
      Alert.alert("Success", result.message);
      setUserLoginFormData(defaultUserLoginFormData);

      if (result.data) setAuth(result.data);

      setTimeout(() => {
        navigation.navigate("TabsStack", { screen: "Home" });
      }, 1000);
    } else {
      Alert.alert("Login Error", result.message);
    }

    setLoading(false);
  };

  const [isModalVisible, setModalVisible] = useState(false);

  const defaultChangePasswordFormData: LoginData = {
    email: "",
    password: "",
  };
  const [changePasswordFormData, setChangePasswordFormData] =
    useState<LoginData>(defaultChangePasswordFormData);

  const handleChangePasswordTextChange = (text: string, fieldname: string) => {
    setChangePasswordFormData({ ...changePasswordFormData, [fieldname]: text });
  };

  const [hideChangePassword, setHideChangePassword] = useState(true);

  const handleChangePassword = async () => {
    // console.log("Change Password Process");
    setLoading(true);

    const result: IResponseProps = await changeUserPassword(
      changePasswordFormData
    );
    console.log(JSON.stringify(result, null, 2));

    if (result.status >= 200 && result.status < 400) {
      Keyboard.dismiss();
      Alert.alert("Success", result.message);
      setChangePasswordFormData(defaultChangePasswordFormData);
      setModalVisible(false);
      setHidePassword(true);
    } else {
      Alert.alert("Change Password Error", result.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    setUserLoginFormData(defaultUserLoginFormData);
  }, []);
  useFocusEffect(
    useCallback(() => {
      setUserLoginFormData(defaultUserLoginFormData);
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>

      <Header goBack={handleGoBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.loginContainer]}
        // iOS: padding menggeser konten ke atas tanpa mengubah tinggi kontainer.
        // Android: height mengurangi tinggi kontainer untuk menghindari tumpang tindih dengan keyboard.
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: screenWidth }}
        >
          <View style={styles.loginScrollContainer}>
            {/* Title */}
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Welcome Back to Cuts!
            </Text>

            {/* Logo */}
            <View
              style={[
                styles.logoContainer,
                {
                  height: 0.3 * screenHeight,
                },
              ]}
            >
              <Logo size={150} iconSize={24} numIcons={12} />
            </View>

            {/* Little Text */}
            <Text style={[styles.text, { color: activeColors.tertiary }]}>
              "
              <Text style={{ color: activeColors.accent }}>
                Ready for a Fresh Cut?
              </Text>
              "
            </Text>

            {/* Inputs */}
            <View style={{ top: -10 }}>
              {/* Email Input */}
              <Input
                key="loginEmail"
                context="Email"
                placeholder="Enter Your Email"
                value={userLoginFormData.email}
                updateValue={(text: string) =>
                  handleLoginTextChange(text, "email")
                }
                iconName="email-outline"
                iconSource="MaterialCommunityIcons"
              />
              {/* Password Input */}
              <Input
                key="loginPassword"
                context="Password"
                isHidden={hidePassword}
                setHidden={setHidePassword}
                placeholder="Enter Your Password"
                value={userLoginFormData.password}
                updateValue={(text: string) =>
                  handleLoginTextChange(text, "password")
                }
                iconName="lock"
                iconSource="Octicons"
              />
            </View>

            {/* Login Button */}
            <Pressable onPress={handleLogin}>
              <Text
                style={[
                  styles.loginButton,
                  {
                    color: activeColors.secondary,
                    backgroundColor: activeColors.accent,
                    width: (screenWidth * 2) / 3 + 50,
                  },
                ]}
              >
                Login
              </Text>
            </Pressable>

            {/* Forgot Password Button */}
            <Pressable
              onPress={() => {
                setModalVisible(true), setHidePassword(true);
              }}
            >
              <Text
                style={[
                  styles.forgotPasswordButton,
                  {
                    color: activeColors.accent,
                  },
                ]}
              >
                Forgot Your Password?
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

            {/* Register Button */}
            <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
              <Text
                style={[
                  styles.registerButton,
                  {
                    color: activeColors.tertiary,
                  },
                ]}
              >
                Don't have an account?
                <Text style={{ color: activeColors.accent, fontWeight: "500" }}>
                  {" "}
                  Register
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal for forgot Password */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setHideChangePassword(true);
          setChangePasswordFormData(defaultChangePasswordFormData);
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
            {/* Title */}
            <Text
              style={[
                styles.modalTitle,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Reset Password
            </Text>

            {/* Inputs */}
            <View>
              {/* Email Input */}
              <Input
                key="forgotPasswordEmail"
                context="Email"
                placeholder="Enter Your Email"
                value={changePasswordFormData.email}
                updateValue={(text: string) =>
                  handleChangePasswordTextChange(text, "email")
                }
                iconName="email-outline"
                iconSource="MaterialCommunityIcons"
              />
              {/* Password Input */}
              <Input
                key="forgotPasswordPassword"
                context="Password"
                isHidden={hideChangePassword}
                setHidden={setHideChangePassword}
                placeholder="Enter New Password"
                value={changePasswordFormData.password}
                updateValue={(text: string) =>
                  handleChangePasswordTextChange(text, "password")
                }
                iconName="lock"
                iconSource="Octicons"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton,
                {
                  backgroundColor: activeColors.accent,
                  width: (screenWidth * 2) / 3 + 50,
                },
              ]}
              onPress={handleChangePassword}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: activeColors.secondary },
                ]}
              >
                Submit
              </Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setModalVisible(false);
                setHideChangePassword(true);
                setChangePasswordFormData(defaultChangePasswordFormData);
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
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
    // paddingTop: 40,
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: -15,
  },
  title: {
    fontSize: 40,
    marginBottom: 5,
    fontWeight: "600",
    marginTop: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: "400",
    top: -25,
  },
  loginContainer: {
    flex: 1,
  },
  loginScrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loginButton: {
    paddingVertical: 12,
    borderRadius: 50,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  forgotPasswordButton: {
    fontSize: 13,
    marginTop: 20,
    fontWeight: "500",
  },
  registerButton: {
    marginTop: 20,
    paddingBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
  },
  modalContent: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "200",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
