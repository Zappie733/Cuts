import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { IPerRatingProps } from "../Types/ComponentTypes/PerRatingTypes";

export const PerRating = ({
  rating,
  totalPerRating,
  totalRating,
}: IPerRatingProps) => {
  const { theme, changeTheme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View style={styles.perRatingContainer}>
      <View style={styles.perRating}>
        <AntDesign name="star" size={20} color="yellow" />
        <Text style={{ color: activeColors.accent }}>({rating})</Text>
      </View>
      {/* bar */}
      <View style={[styles.bar, { borderColor: activeColors.tertiary }]}>
        <View
          style={{
            width: totalPerRating
              ? `${(totalPerRating / totalRating) * 100}%`
              : "0%",
            backgroundColor: activeColors.tertiary,
          }}
        >
          <Text></Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  perRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  perRating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  bar: {
    width: "80%",
    height: "100%",
    borderWidth: 1,
    borderRadius: 5,
  },
});
