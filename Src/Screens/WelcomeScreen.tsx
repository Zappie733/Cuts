import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import React from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { colors } from "../Config/Theme";
import { Logo } from "../Components/Logo";
import { Zocial, AntDesign } from "@expo/vector-icons";
import { Theme } from "../Contexts/ThemeContext";
import { useContext } from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

export const WelcomeScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"Welcome">) => {
  const screenHeight = Dimensions.get("screen").height;
  const screenWidth = Dimensions.get("screen").width;

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const navigateToLoginScreen = () => {
    navigation.navigate("LoginScreen");
  };
  // const navigateToHomeScreen = () => {
  //   navigation.navigate("TabsStack", { screen: "Home" });
  // };
  const navigateToRegisterScreen = () => {
    navigation.navigate("RegisterScreen");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: screenWidth }}
      >
        {/* logo */}
        <View
          style={[
            styles.logoContainer,
            {
              height: 0.55 * screenHeight,
            },
          ]}
        >
          <Logo size={220} iconSize={30} numIcons={16} />
        </View>

        <View style={styles.contentContainer}>
          {/* welcome */}
          <Text style={[styles.title, { color: activeColors.accent }]}>
            Welcome to Cuts
          </Text>
          {/* slogan */}
          <Text style={[styles.slogan, { color: activeColors.tertiary }]}>
            "Elevate Your Hair, Elevate Your Style"
          </Text>
          {/* Login */}
          <Pressable
            onPress={navigateToLoginScreen}
            style={[
              styles.loginContainer,
              {
                backgroundColor: activeColors.accent,
                width: 0.75 * screenWidth,
              },
            ]}
          >
            <AntDesign
              name="login"
              size={18}
              color={activeColors.tertiary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.text, { color: activeColors.secondary }]}>
              Login to an Account
            </Text>
          </Pressable>
          {/* Guest */}
          {/* <Pressable
            onPress={navigateToHomeScreen}
            style={[
              styles.guestContainer,
              {
                backgroundColor: activeColors.secondary,
                width: 0.75 * screenWidth,
              },
            ]}
          >
            <Zocial
              name="guest"
              size={18}
              color={activeColors.tertiary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.text, { color: activeColors.accent }]}>
              Continue as Guest
            </Text>
          </Pressable> */}

          {/* Register */}
          <Pressable
            onPress={navigateToRegisterScreen}
            style={[
              styles.registerContainer,
              {
                backgroundColor: activeColors.secondary,
                width: 0.75 * screenWidth,
              },
            ]}
          >
            <Zocial
              name="guest"
              size={18}
              color={activeColors.tertiary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.text, { color: activeColors.accent }]}>
              Register an Account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    top: -75,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
  },
  slogan: {
    fontSize: 20,
    fontWeight: "600",
  },
  loginContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 40,
    padding: 20,
    borderRadius: 50,
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
  },
  guestContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    padding: 20,
    borderRadius: 50,
  },
  registerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    padding: 20,
    borderRadius: 50,
  },
  buttonIcon: {
    marginLeft: 20,
  },
});
