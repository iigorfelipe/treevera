import { BREAKPOINTS } from "@/common/constants/breakpoints";
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = Number(BREAKPOINTS.sm.replace("px", ""));
const TABLET_BREAKPOINT = Number(BREAKPOINTS.md.replace("px", ""));

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      setIsTablet(window.innerWidth <= TABLET_BREAKPOINT);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
};
