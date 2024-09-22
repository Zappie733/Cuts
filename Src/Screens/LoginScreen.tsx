import {
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
import React, { useState } from "react";
import { Header } from "../Components/Header";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { colors } from "../Config/Theme";
import { Input } from "../Components/Input";
import { ILoginProps } from "../Types/LoginScreenTypes";
import { Logo } from "../Components/Logo";

export const LoginScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"LoginScreen">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const screenHeight = Dimensions.get("screen").height;
  const screenWidth = Dimensions.get("screen").width;
  let activeColors = colors.dark;

  const defaultUserLoginFormData: ILoginProps = {
    email: "",
    password: "",
  };
  const [userLoginFormData, setUserLoginFormData] = useState<ILoginProps>(
    defaultUserLoginFormData
  );
  const handleLoginTextChange = (text: string, fieldname: string) => {
    setUserLoginFormData({ ...userLoginFormData, [fieldname]: text });
  };

  const [showPassword, setShowPassword] = useState(true);
  const handleShowPassword = (condition: boolean) => {
    setShowPassword(condition);
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
            {/* Logo */}
            <View
              style={[
                styles.logoContainer,
                {
                  height: 0.3 * screenHeight,
                },
              ]}
            >
              <Logo size={120} iconSize={24} numIcons={12} />
            </View>

            <Text style={[styles.title, { color: activeColors.accent }]}>
              Welcome Back to Cuts!
            </Text>
            <Text style={[styles.text, { color: activeColors.tertiary }]}>
              Please login to your account
            </Text>

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
            {/* <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
          <Text style={{ fontSize: 20, color: "white" }}>
            Go to Register Screen
          </Text>
        </Pressable> */}
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
  },
  title: {
    fontSize: 26,
    marginBottom: 5,
  },
  text: {
    fontSize: 20,
    marginBottom: 40,
  },
  loginContainer: {
    flex: 1,
  },
  loginScrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
