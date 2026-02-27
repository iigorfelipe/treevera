import { useEffect, useRef } from "react";

export const useMidnightRefresh = (onMidnight: () => void) => {
  const callbackRef = useRef(onMidnight);
  callbackRef.current = onMidnight;

  useEffect(() => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - Date.now();

    const timeout = setTimeout(() => callbackRef.current(), ms);
    return () => clearTimeout(timeout);
  }, []);
};
