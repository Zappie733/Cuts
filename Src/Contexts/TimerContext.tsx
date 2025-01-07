import React, { createContext, useContext, useState, useCallback } from "react";

interface TimerContextType {
  timers: Record<string, number>;
  intervals: Record<string, NodeJS.Timeout>;
  startTimer: (
    id: string,
    initialTime: number,
    onEndCallback: () => void
  ) => void;
  clearTimer: (id: string) => void;
  getTime: (id: string) => number | null;
}

const Timer = createContext<TimerContextType | undefined>(undefined);

export const TimerContext = ({ children }: { children: React.ReactNode }) => {
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [intervals, setIntervals] = useState<Record<string, NodeJS.Timeout>>(
    {}
  );

  const startTimer = useCallback(
    (id: string, initialTime: number, onEndCallback: () => void) => {
      if (intervals[id]) return; // Avoid starting a new interval if one already exists

      setTimers((prev) => ({ ...prev, [id]: initialTime }));

      const interval = setInterval(() => {
        setTimers((prev) => {
          const newTimers = { ...prev, [id]: prev[id] - 1 };
          if (newTimers[id] === 0) {
            // clearInterval(interval);
            console.log(`Timer with ID ${id} reached 0`);
            clearTimer(id); // Clears the interval and removes the timer state
            onEndCallback();
          }
          return newTimers;
        });
      }, 1000);

      setIntervals((prev) => ({ ...prev, [id]: interval }));
    },
    [intervals, timers]
  );

  const clearTimer = useCallback(
    (id: string) => {
      setIntervals((prevIntervals) => {
        console.log(`Clearing timer with ID: ${id}`);
        console.log(`Current intervals:`, prevIntervals);

        if (prevIntervals[id]) {
          clearInterval(prevIntervals[id]);
          const newIntervals = { ...prevIntervals };
          console.log(`Before deleting interval:`, newIntervals);
          delete newIntervals[id];
          console.log(`After deleting interval:`, newIntervals);
          return newIntervals;
        }

        return prevIntervals; // Return unchanged state if interval doesn't exist
      });

      setTimers((prevTimers) => {
        console.log(`Current timers:`, prevTimers);

        if (prevTimers[id]) {
          const newTimers = { ...prevTimers };
          console.log(`Before deleting timer:`, newTimers);
          delete newTimers[id];
          console.log(`After deleting timer:`, newTimers);
          return newTimers;
        }

        return prevTimers; // Return unchanged state if timer doesn't exist
      });
    },
    [intervals, timers]
  );

  const getTime = (id: string) => {
    return timers[id] ?? null;
  };

  return (
    <Timer.Provider
      value={{ timers, intervals, startTimer, clearTimer, getTime }}
    >
      {children}
    </Timer.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(Timer);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
