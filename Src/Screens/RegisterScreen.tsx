import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";
import React, { useContext, useState } from "react";
import { Header } from "../Components/Header";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { colors } from "../Config/Theme";
import { Input } from "../Components/Input";
import { IRegistrationProps } from "../Types/RegisterScreenTypes";
import { AntDesign } from "@expo/vector-icons";
import { Theme } from "../Contexts/ThemeContext";

export const RegisterScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"RegisterScreen">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const screenHeight = Dimensions.get("screen").height;
  const screenWidth = Dimensions.get("screen").width;

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [isModalVisible, setModalVisible] = useState(false);

  const handleBenefit = () => {
    console.log("Benefits");
    setModalVisible(true);
  };

  const defaultUserRegisterFormData: IRegistrationProps = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
  };
  const [userRegisterFormData, setuserRegisterFormData] =
    useState<IRegistrationProps>(defaultUserRegisterFormData);
  const handleRegisterTextChange = (text: string, fieldname: string) => {
    setuserRegisterFormData({ ...userRegisterFormData, [fieldname]: text });
  };
  console.log(userRegisterFormData);
  const [showPassword, setShowPassword] = useState(true);
  const handleShowPassword = (condition: boolean) => {
    setShowPassword(condition);
  };

  const [showCPassword, setShowCPassword] = useState(true);
  const handleShowCPassword = (condition: boolean) => {
    setShowCPassword(condition);
  };

  const handleRegister = () => {
    console.log("register");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
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
              Join Cuts & Enjoy The Benefits
            </Text>

            {/* Benefits Button */}
            <Pressable onPress={handleBenefit}>
              <Text
                style={[
                  styles.benefitsButton,
                  {
                    color: activeColors.tertiary,
                  },
                ]}
              >
                What are the Benefits?{" "}
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
            <View>
              {/* FirstName Input */}
              <Input
                key="registerFirstName"
                context="First Name"
                placeholder="Enter Your First Name"
                value={userRegisterFormData.firstName}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "firstName")
                }
                iconName="person"
                iconSource="Octicons"
              />
              {/* LastName Input */}
              <Input
                key="registerLastName"
                context="Last Name"
                placeholder="Enter Your Last Name"
                value={userRegisterFormData.lastName}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "lastName")
                }
                iconName="person"
                iconSource="Octicons"
              />
              {/* Email Input */}
              <Input
                key="registerEmail"
                context="Email"
                placeholder="Enter Your Email"
                value={userRegisterFormData.email}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "email")
                }
                iconName="email-outline"
                iconSource="MaterialCommunityIcons"
              />
              {/* Password Input */}
              <Input
                key="registerPassword"
                context="Password"
                isHidden={showPassword}
                setHidden={setShowPassword}
                placeholder="Enter Your Password"
                value={userRegisterFormData.password}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "password")
                }
                iconName="lock"
                iconSource="Octicons"
              />
              {/* Confirm Password Input */}
              <Input
                key="registerConfirmPassword"
                context="Confirm Password"
                isHidden={showCPassword}
                setHidden={setShowCPassword}
                placeholder="Enter Your Confirm Password"
                value={userRegisterFormData.confirmPassword}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "confirmPassword")
                }
                iconName="lock"
                iconSource="Octicons"
              />
              {/* Mobile Number Input */}
              <Input
                key="registerMobileNo"
                context="Mobile Number"
                placeholder="Enter Your Mobile Number"
                value={userRegisterFormData.mobileNo}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "mobileNo")
                }
                iconName="phone"
                iconSource="Feather"
              />
            </View>

            {/* Register Button */}
            <Pressable onPress={handleRegister}>
              <Text
                style={[
                  styles.registerButton,
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

            {/* Login Button */}
            <Pressable onPress={() => navigation.navigate("LoginScreen")}>
              <Text
                style={[
                  styles.loginButton,
                  {
                    color: activeColors.tertiary,
                  },
                ]}
              >
                Already have an account?
                <Text style={{ color: activeColors.accent, fontWeight: "500" }}>
                  {" "}
                  Login
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal for Benefits */}
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
              Benefits of Joining
            </Text>
            {/* Content */}
            <Text
              style={[
                styles.modalContent,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • Book online reservation{"\n"}• Rate places and products
              {"\n"}• See and Like posts{"\n"}• Wishlist functionality {"\n"}•
              And much more!
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 40 : 0,
    flex: 1,
  },
  registerContainer: {
    flex: 1,
  },
  registerScrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  registerButton: {
    paddingVertical: 12,
    borderRadius: 50,
    textAlign: "center",
    fontSize: 16,
    marginVertical: 10,
    fontWeight: "500",
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    fontWeight: "600",
    marginTop: 20,
  },
  benefitsButton: {
    fontSize: 13,
    marginTop: 5,
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
  },
  loginButton: {
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
    width: "75%",
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
});
