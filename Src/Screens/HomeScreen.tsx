import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useContext } from "react";
import { colors } from "../Config/Theme";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { Theme } from "../Contexts/ThemeContext";
export const HomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

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
