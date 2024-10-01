import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";

export const ProfileScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"Profile">) => {
  return (
    <View>
      <Text>ProfileScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({});
