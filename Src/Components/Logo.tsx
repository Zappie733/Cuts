import { Animated, Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { colors } from "../Config/Theme";
import { Entypo } from "@expo/vector-icons";
import { ILogoProps } from "../Types/LogoTypes";

export const Logo = ({ size, iconSize, numIcons }: ILogoProps) => {
  let activeColors = colors.dark;

  // const iconSize = 30;
  // const numIcons = 16;
  // const radius = 140;
  const radius = (size + 30) / 2;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: size * 120, // Duration of the animation (10 seconds)
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderIconsInCircle = () => {
    let icons = [];

    for (let i = 0; i < numIcons; i++) {
      const angle = (i / numIcons) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const adjustment = (i * 360) / numIcons;
      let rotateAngle = 180 + adjustment;

      // console.log(adjustment);
      icons.push(
        <Entypo
          key={i}
          name="scissors"
          size={iconSize}
          color={activeColors.tertiary}
          style={{
            position: "absolute",
            transform: [
              { translateX: x },
              { translateY: y },
              { rotate: `${rotateAngle}deg` },
            ],
          }}
        />
      );
    }
    return icons;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeColors.secondary,
          borderColor: activeColors.accent,
        },
      ]}
    >
      <Image
        source={
          activeColors.primary === "#27374D"
            ? require("../../assets/Logo.png")
            : require("../../assets/Logo2.png")
        }
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            backgroundColor: activeColors.accent,
          },
        ]}
      />

      <Animated.View
        style={{
          position: "absolute",
          // width: 280,
          // height: 280,
          // backgroundColor: "black",
          // opacity: 0.3,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: rotateInterpolation }],
        }}
      >
        {renderIconsInCircle()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "auto",
    height: "auto",
    borderRadius: 150,
    borderWidth: 2,
  },
  logo: {
    // width: 250,
    // height: 250,
    borderRadius: 150,
  },
});
