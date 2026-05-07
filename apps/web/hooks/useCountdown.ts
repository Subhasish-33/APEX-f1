"use client";

import { useState, useEffect, useMemo } from "react";

export function useCountdown(targetDate: string | Date) {
  const countDownDate = useMemo(() => new Date(targetDate).getTime(), [targetDate]);

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
}

const getReturnValues = (countDown: number) => {
  // Calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { 
    days: Math.max(0, days), 
    hours: Math.max(0, hours), 
    minutes: Math.max(0, minutes), 
    seconds: Math.max(0, seconds),
    isExpired: countDown <= 0 
  };
};
