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
import React, { useRef, useState } from "react";
import { colors } from "../Config/Theme";
import { IInputProps } from "../Types/InputTypes";
import { Feather, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

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
}: IInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  let activeColors = colors.dark;

  const borderWidth = useRef(new Animated.Value(0)).current;

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
    setIsVisible(true);
    borderWidthAnimation(1);
  };

  const onBlurHandler = () => {
    if (value) return;
    setIsVisible(false);
    borderWidthAnimation(0);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderWidth,
          borderColor: borderColorAnimation,
          backgroundColor: activeColors.secondary,
          marginTop: isVisible ? 20 : 10,
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

      {iconName !== undefined && iconSource !== undefined ? (
        <View style={styles.input}>
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
          <TextInput
            style={[styles.textInput, { color: activeColors.accent }]}
            placeholder={placeholder}
            placeholderTextColor={activeColors.accent}
            secureTextEntry={isHidden === undefined ? false : isHidden}
            value={value}
            onChangeText={updateValue}
            editable={true}
            onFocus={onFocusHandler}
            onBlur={onBlurHandler}
            blurOnSubmit={true}
            autoCapitalize={"none"}
          />
        </View>
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
          editable={true}
          onFocus={onFocusHandler}
          onBlur={onBlurHandler}
          blurOnSubmit={true}
          autoCapitalize={"none"}
        />
      )}

      {isHidden !== undefined && (
        <Pressable
          style={styles.eye}
          onPress={() => setHidden && setHidden(!isHidden)}
        >
          <Feather
            name={isHidden ? "eye-off" : "eye"}
            size={24}
            color={activeColors.tertiary}
          />
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    width,
    paddingVertical: 8,
    justifyContent: "center",
  },
  input: { flexDirection: "row", alignItems: "center" },
  textInput: {
    fontSize: 15,
    paddingVertical: 10,
  },
  icon: {
    marginHorizontal: 15,
  },
  eye: {
    position: "absolute",
    top: 20,
    right: 15,
  },
});
