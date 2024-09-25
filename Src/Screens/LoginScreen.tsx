import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useContext, useState } from "react";
import { Header } from "../Components/Header";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { colors } from "../Config/Theme";
import { Input } from "../Components/Input";
import { ILoginProps } from "../Types/LoginScreenTypes";
import { Logo } from "../Components/Logo";
import { Theme } from "../Contexts/ThemeContext";
import { IResponseProps } from "../Types/ResponseTypes";
import { loginUser } from "../Middlewares/UserMiddlewares";

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

  const defaultUserLoginFormData: ILoginProps = {
    email: "",
    password: "",
  };
  const [userLoginFormData, setUserLoginFormData] = useState<ILoginProps>(
    defaultUserLoginFormData
  );
  console.log(userLoginFormData);
  const handleLoginTextChange = (text: string, fieldname: string) => {
    setUserLoginFormData({ ...userLoginFormData, [fieldname]: text });
  };

  const [showPassword, setShowPassword] = useState(true);
  const handleShowPassword = (condition: boolean) => {
    setShowPassword(condition);
  };

  const handleLogin = async () => {
    console.log("Login Process");
    const result: IResponseProps = await loginUser(userLoginFormData);
    console.log(JSON.stringify(result, null, 2));

    if (result.status >= 200 && result.status < 400) {
      Keyboard.dismiss();
      Alert.alert("Success", result.response.message);
      setUserLoginFormData(defaultUserLoginFormData);

      setTimeout(() => {
        navigation.navigate("TabsStack", { screen: "Home" });
      }, 2000);
    } else {
      Alert.alert("Registration Error", result.response.message);
    }
  };

  const handleForgotPassword = () => {
    console.log("forgot password");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
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
                isHidden={showPassword}
                setHidden={setShowPassword}
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
            <Pressable onPress={handleForgotPassword}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 40 : 0,
    flex: 1,
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
});
