import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Button,
  Platform,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../Config/Theme";
import { IDateTimePickerProps } from "../Types/ComponentTypes/DateTimePickerTypes";
import { Theme } from "../Contexts/ThemeContext";

export const DateTimePickerComponent = ({
  onPress,
  isDisabled,
}: IDateTimePickerProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [date, setDate] = useState(new Date(Date.now() + 7 * 60 * 60 * 1000));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false); // Close the date picker
    if (selectedDate) {
      setDate(selectedDate); // Update the date
      setShowTimePicker(true); // Open the time picker
    }
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false); // Close the time picker
    if (selectedTime) {
      // Combine the selected time with the date
      const updatedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setDate(updatedDate);
      onPress(updatedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled
              ? activeColors.disabledColor
              : activeColors.secondary,
          },
        ]}
        disabled={isDisabled}
      >
        <Text style={{ color: activeColors.accent }}>Select Date & Time</Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date" // Date picker
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time" // Time picker
          display="default"
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
