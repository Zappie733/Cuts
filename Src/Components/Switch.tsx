import React, { useContext, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { ISwitchProps } from "../Types/SwitchTypes";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";

export const Switch = ({ onPress }: ISwitchProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [isEnabled, setIsEnabled] = useState(false);
  const switchTranslateX = useRef(new Animated.Value(0)).current;

  const switchTranslateXAnimation = (toValue: number) => {
    Animated.timing(switchTranslateX, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const switchTranslate = switchTranslateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const onChangeHandler = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    switchTranslateXAnimation(newValue ? 1 : 0);

    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.switchContainer,
        { backgroundColor: activeColors.tertiary },
      ]}
      onPress={onChangeHandler}
    >
      <Animated.View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX: switchTranslate }],
            backgroundColor: activeColors.accent,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  switchThumb: {
    width: 25,
    height: 25,
    borderRadius: 20,
  },
});
