import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import { colors } from "../Config/Theme";
import { IInputProps } from "../Types/InputTypes";
import {
  EvilIcons,
  Feather,
  Fontisto,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { Theme } from "../Contexts";

const width = (Dimensions.get("screen").width * 2) / 3 + 50;

export const Input = ({
  context,
  placeholder,
  isHidden,
  setHidden,
  value,
  updateValue,
  iconName,
  iconSource,
  isEditable,
  setEditable,
  isDisabled,
}: IInputProps) => {
  const [isVisible, setIsVisible] = useState(
    isEditable !== undefined || isDisabled === true ? true : false
  );

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const borderWidth = useRef(
    new Animated.Value(isEditable !== undefined || isDisabled === true ? 1 : 0)
  ).current;

  const borderWidthAnimation = (toValue: number) => {
    Animated.timing(borderWidth, {
      toValue,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.ease,
    }).start();
  };
  const borderColorAnimation = borderWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [activeColors.secondary, activeColors.tertiary],
    extrapolate: "clamp",
  });

  const onFocusHandler = () => {
    if (isEditable === undefined) setIsVisible(true);
    borderWidthAnimation(1);
  };

  const onBlurHandler = () => {
    if (value) return;
    if (isEditable === undefined) setIsVisible(false);
    borderWidthAnimation(0);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderWidth,
          borderColor: borderColorAnimation,
          backgroundColor:
            isEditable === false || isDisabled === true
              ? activeColors.disabledColor
              : activeColors.secondary,
          marginVertical: 10,
        },
      ]}
    >
      {isVisible && (
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

      <View style={styles.input}>
        {iconName !== undefined && iconSource !== undefined ? (
          <>
            {iconSource === "MaterialCommunityIcons" && (
              <MaterialCommunityIcons
                name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
                size={24}
                color={activeColors.tertiary}
                style={styles.icon}
              />
            )}
            {iconSource === "Octicons" && (
              <Octicons
                name={iconName as keyof typeof Octicons.glyphMap}
                size={24}
                color={activeColors.tertiary}
                style={styles.icon}
              />
            )}
            {iconSource === "Feather" && (
              <Feather
                name={iconName as keyof typeof Feather.glyphMap}
                size={24}
                color={activeColors.tertiary}
                style={styles.icon}
              />
            )}
            {iconSource === "Fontisto" && (
              <Fontisto
                name={iconName as keyof typeof Fontisto.glyphMap}
                size={24}
                color={activeColors.tertiary}
                style={styles.icon}
              />
            )}
            {iconSource === "EvilIcons" && (
              <EvilIcons
                name={iconName as keyof typeof EvilIcons.glyphMap}
                size={24}
                color={activeColors.tertiary}
                style={styles.icon}
              />
            )}
            <TextInput
              style={[styles.textInput, { color: activeColors.accent }]}
              placeholder={placeholder}
              placeholderTextColor={activeColors.accent}
              secureTextEntry={isHidden === undefined ? false : isHidden}
              value={value}
              onChangeText={updateValue}
              editable={
                isEditable === undefined && isDisabled === undefined
                  ? true
                  : isDisabled === true
                  ? false
                  : isEditable
              }
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              // blurOnSubmit={true}
              autoCapitalize={"none"}
              multiline={context !== "Location" ? false : true}
              numberOfLines={1}
            />
          </>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              { color: activeColors.accent, paddingHorizontal: 10 },
            ]}
            placeholder={placeholder}
            placeholderTextColor={activeColors.accent}
            secureTextEntry={isHidden === undefined ? false : isHidden}
            value={value}
            onChangeText={updateValue}
            editable={
              isEditable === undefined && isDisabled === undefined
                ? true
                : isDisabled === true
                ? false
                : isEditable
            }
            onFocus={onFocusHandler}
            onBlur={onBlurHandler}
            autoCapitalize={"none"}
            multiline={context !== "Location" ? false : true}
            numberOfLines={1}
          />
        )}

        {isHidden !== undefined && (
          <Pressable
            style={styles.actionIcon}
            onPress={() => setHidden && setHidden(!isHidden)}
          >
            <Feather
              name={isHidden ? "eye-off" : "eye"}
              size={24}
              color={activeColors.tertiary}
            />
          </Pressable>
        )}

        {isEditable !== undefined && (
          <Pressable
            style={styles.actionIcon}
            onPress={() => setEditable && setEditable(!isEditable)}
          >
            <Feather
              name={isEditable ? "x" : "edit-2"}
              size={24}
              color={activeColors.tertiary}
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    width,
    paddingVertical: 8,
    justifyContent: "center",
    paddingRight: 10,
  },
  input: { flexDirection: "row", alignItems: "center" },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  icon: {
    marginHorizontal: 15,
  },
  actionIcon: {
    // position: "absolute",
    // top: 20,
    // right: 15,
    marginHorizontal: 10,
  },
});
