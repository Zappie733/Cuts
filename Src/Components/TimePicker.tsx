import React, { useContext, useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { ITimePickerProps } from "../Types/ComponentTypes/TimePickerTypes";

export const TimePicker = ({ onPress, isForUpdate }: ITimePickerProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [date, setDate] = useState(new Date(Date.now() + 7 * 60 * 60 * 1000));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false); // Close the time picker
    if (selectedTime) {
      // Update the time part of the date, leaving the date untouched
      const updatedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setDate(updatedDate);
      onPress(updatedDate); // Pass the selected time back to the parent component
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setShowTimePicker(true)}
        style={[styles.button, { backgroundColor: activeColors.secondary }]}
      >
        <Text style={{ color: activeColors.accent }}>
          {isForUpdate ? "Change Time" : "Select Time"}
        </Text>
      </Pressable>

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time" // Time picker mode
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
