import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useContext, useEffect } from "react";
import { ISearchBarProps } from "../Types/ComponentTypes/SearchBarTypes";
import { colors } from "../Config/Theme";
import { EvilIcons } from "@expo/vector-icons";
import { Theme } from "../Contexts/ThemeContext";

export const SearchBar = ({
  placeHolder,
  input,
  onSearch,
  onPress,
}: ISearchBarProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeColors.secondary,
          borderColor: activeColors.tertiary,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <TextInput
          placeholder={placeHolder}
          onChangeText={onSearch}
          value={input}
          style={[styles.input, { color: activeColors.accent }]}
          placeholderTextColor={activeColors.accent}
          onSubmitEditing={onPress}
        />
      </View>

      <Pressable onPress={onPress}>
        <EvilIcons name="search" size={28} color={activeColors.accent} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  input: {
    fontSize: 14,
  },
});
