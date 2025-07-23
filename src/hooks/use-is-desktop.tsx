import { BREAKPOINTS } from "@/design-system/tokens/breakpoints";
import { useState, useEffect } from "react";

const DESKTOP_BREAKPOINT = Number(BREAKPOINTS.xl.split("px")[0]);

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined"
      ? window.innerWidth >= DESKTOP_BREAKPOINT
      : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
};
