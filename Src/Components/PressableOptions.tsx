import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import {
  Entypo,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { PressableOptionsProps } from "../Types/ComponentTypes/PressableOptionsTypes";

export const PressableOptions = ({
  onPress,
  iconName,
  iconSource,
  text,
  iconSize,
  fontSize,
}: PressableOptionsProps) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View>
      <Pressable
        onPress={onPress}
        style={[styles.option, { backgroundColor: activeColors.secondary }]}
      >
        <View>
          {iconSource === "Entypo" ? (
            <Entypo
              name={iconName as keyof typeof Entypo.glyphMap}
              size={iconSize}
              color={activeColors.accent}
            />
          ) : iconSource === "MaterialIcons" ? (
            <MaterialIcons
              name={iconName as keyof typeof MaterialIcons.glyphMap}
              size={iconSize}
              color={activeColors.accent}
            />
          ) : iconSource === "Ionicons" ? (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={iconSize}
              color={activeColors.accent}
            />
          ) : iconSource === "Fontisto" ? (
            <Fontisto
              name={iconName as keyof typeof Fontisto.glyphMap}
              size={iconSize}
              color={activeColors.accent}
            />
          ) : iconSource === "FontAwesome5" ? (
            <FontAwesome5
              name={iconName as keyof typeof FontAwesome5.glyphMap}
              size={iconSize}
              color={activeColors.accent}
            />
          ) : (
            ""
          )}
        </View>
        <Text
          style={[
            {
              color: activeColors.accent,
              fontSize,
              marginTop: 5,
              textAlign: "center",
            },
          ]}
        >
          {text}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  option: {
    width: 100,
    height: 100,
    padding: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
});
