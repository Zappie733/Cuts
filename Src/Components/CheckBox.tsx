import React, { useContext, useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { ICheckBoxProps } from "../Types/ComponentTypes/CheckBoxTypes";
import { colors } from "../Config/Theme";
import { Theme } from "../Contexts/ThemeContext";

export const CheckBox = ({ label, value, onPress }: ICheckBoxProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];
  const [isChecked, setIsChecked] = useState(value);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          setIsChecked(!isChecked);
          onPress(!isChecked);
        }}
        style={[
          styles.checkbox,
          isChecked && styles.checkedCheckbox,
          {
            borderColor: isChecked
              ? activeColors.secondary
              : activeColors.tertiary,
          },
        ]}
      >
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Text style={[styles.label, { color: activeColors.tertiary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkedCheckbox: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 18,
  },
  label: {
    fontSize: 16,
  },
});
