import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { Entypo, Fontisto } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { MultiSelectDropdownPickerProps } from "../Types/ComponentTypes/MultiSelectDropdownPickerTypes";

export const MultiSelectDropdownPicker = ({
  options,
  selectedValues,
  onValuesChange,
  placeHolder,
  iconName,
  iconSource,
  isInput,
  context,
}: MultiSelectDropdownPickerProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsDropdownOpen(false);
    }, [])
  );

  const handleSelect = (value: string) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value) // Deselect if already selected
      : [...selectedValues, value]; // Add to selected values if not selected

    onValuesChange(updatedValues);
    setIsDropdownOpen(false);
  };

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  const displayedLabel =
    selectedLabels.length > 0 ? selectedLabels.join(", ") : placeHolder;

  return (
    <View style={styles.container}>
      {isInput === true &&
        context !== undefined &&
        displayedLabel !== placeHolder && (
          <Text
            style={{
              color: activeColors.tertiary,
              position: "absolute",
              top: -20,
              left: 12,
              fontSize: 15,
            }}
          >
            {context}
          </Text>
        )}

      <TouchableOpacity
        style={[
          isInput === true ? styles.dropdownButtonInput : styles.dropdownButton,
          isInput === true &&
          context !== undefined &&
          displayedLabel !== placeHolder
            ? {
                backgroundColor: activeColors.secondary,
                borderWidth: 1,
                borderColor: activeColors.tertiary,
              }
            : {
                backgroundColor: activeColors.secondary,
                height: "auto",
              },
        ]}
        onPress={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <View style={{ flex: 1 }}>
          {iconName !== undefined && iconSource !== undefined ? (
            <View style={styles.dropdownContainer}>
              {iconSource === "Fontisto" && (
                <Fontisto
                  name={iconName as keyof typeof Fontisto.glyphMap}
                  size={24}
                  color={activeColors.tertiary}
                />
              )}
              <Text
                style={[styles.selectedText, { color: activeColors.accent }]}
              >
                {displayedLabel}
              </Text>
            </View>
          ) : (
            <Text style={[styles.selectedText, { color: activeColors.accent }]}>
              {displayedLabel}
            </Text>
          )}
        </View>
        <View style={{ width: 20 }}>
          <Entypo name="chevron-down" size={20} color={activeColors.tertiary} />
        </View>
      </TouchableOpacity>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <View
          style={[
            styles.dropdownListContainer,
            { backgroundColor: activeColors.accent },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              {options.map((item) => (
                <TouchableOpacity
                  key={item.value.toString()}
                  style={[
                    styles.dropdownItem,
                    selectedValues.includes(item.value) && {
                      backgroundColor: activeColors.tertiary, // Highlight selected items
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: activeColors.secondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdownButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonInput: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: {
    fontSize: 15,
    marginLeft: 10,
  },
  dropdownListContainer: {
    position: "absolute",
    top: 0, // Adjust based on the height of the dropdown button
    left: 0,
    right: 0,
    borderRadius: 20,
    maxHeight: 175,
    overflow: "hidden",
  },
  dropdownItem: {
    height: 62,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontSize: 15,
  },
});
