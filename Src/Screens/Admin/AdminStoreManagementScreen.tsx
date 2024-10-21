import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
} from "react-native";
import React, { useContext } from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";

export const AdminStoreManagementScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"StoreManagement">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text>Store Management Screen</Text>
    </View>
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
