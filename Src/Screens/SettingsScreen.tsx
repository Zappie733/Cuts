import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { colors } from "../Config/Theme";
import { Theme } from "../Contexts/ThemeContext";

export const SettingsScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Settings">) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text style={{ color: activeColors.tertiary, fontSize: 30 }}>
        Theme: {theme.mode}
      </Text>
      <Pressable
        onPress={() => {
          changeTheme();
        }}
      >
        <Text style={{ color: activeColors.accent, fontSize: 30 }}>
          Change Theme
        </Text>
      </Pressable>
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
