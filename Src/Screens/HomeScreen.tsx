import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState } from "react";
import { colors } from "../Config/Theme";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { Theme } from "../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Header } from "../Components/Header";
import { Auth } from "../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const HomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { auth } = useContext(Auth);
  const handleGoBack = () => {
    navigation.goBack();
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

      {auth._id === "" && <Header goBack={handleGoBack} />}
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />

      <Text>Home Screen</Text>
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
});
