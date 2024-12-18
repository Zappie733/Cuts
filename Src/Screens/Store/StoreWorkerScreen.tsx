import { useContext, useEffect, useState } from "react";
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
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreWorkerScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreWorkers">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: screenWidth }}
      >
        <Text>Store Workers</Text>
      </ScrollView>
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
});
