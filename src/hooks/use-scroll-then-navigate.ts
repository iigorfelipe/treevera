import { useCallback } from "react";
import { useResponsive } from "./use-responsive";

export function useScrollThenNavigate() {
  const { isTablet } = useResponsive();

  return useCallback(
    (action: () => void) => {
      if (!isTablet || window.scrollY === 0) {
        action();
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        action();
      };

      window.addEventListener("scrollend", go, { once: true });
      setTimeout(go, 450);
    },
    [isTablet],
  );
}
