import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export const Timer = () => {
  const [time, setTime] = useState("24:00:00");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setTime(`${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1 text-right">
      <Clock className="text-muted-foreground size-3 shrink-0" />
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {time}
      </span>
    </div>
  );
};
