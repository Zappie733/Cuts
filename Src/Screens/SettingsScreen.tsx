import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  let activeColors = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text>SettingScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
