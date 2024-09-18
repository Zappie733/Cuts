import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { colors } from "../Config/Theme";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
export const HomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  let activeColors = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text>HomeScreen</Text>
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
