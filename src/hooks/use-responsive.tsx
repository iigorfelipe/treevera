import { BREAKPOINTS } from "@/design-system/tokens/breakpoints";
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = Number(BREAKPOINTS.sm.split("px")[0]);
const TABLET_BREAKPOINT = Number(BREAKPOINTS.md.split("px")[0]);

const inititalMobileValue =
  typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;

const inititalTabletValue =
  typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(inititalMobileValue);
  const [isTablet, setIsTablet] = useState(inititalTabletValue);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      setIsTablet(window.innerWidth <= TABLET_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
};
