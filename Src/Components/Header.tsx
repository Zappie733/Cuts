import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { IHeaderProps } from "../Types/HeaderTypes";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../Config/Theme";
import { Theme } from "../Contexts/ThemeContext";

export const Header = ({ goBack }: IHeaderProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Pressable onPress={goBack}>
        <Ionicons
          name="chevron-back-circle"
          size={32}
          color={activeColors.accent}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
