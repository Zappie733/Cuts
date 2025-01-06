import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTimer } from "../Contexts/TimerContext";

interface CountdownTimerProps {
  id: string;
  initialMinutes: number;
  onTimerEnd: () => void;
}

const CountdownTimer = ({
  id,
  initialMinutes,
  onTimerEnd,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { startTimer, clearTimer, getTime, timers } = useTimer(); // Get the timer functions from context

  useEffect(() => {
    if (timeLeft === null) {
      const savedTime = getTime(id);
      const initialTime = savedTime ?? initialMinutes * 60;
      setTimeLeft(initialTime);

      // Start the timer if it's not already running
      startTimer(id, initialTime, onTimerEnd);
    }

    return () => {
      // Optional: Cleanup if you want to stop timers when unmounted
      // clearTimer(id);
    };
  }, [
    id,
    initialMinutes,
    timeLeft,
    startTimer,
    clearTimer,
    getTime,
    onTimerEnd,
  ]);

  useEffect(() => {
    // Update local state when the global timer changes
    const updatedTime = timers[id] ?? null;
    if (updatedTime !== timeLeft) {
      setTimeLeft(updatedTime);
    }
  }, [timers, id, timeLeft]); // Update timeLeft whenever the global timer changes

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CountdownTimer;
