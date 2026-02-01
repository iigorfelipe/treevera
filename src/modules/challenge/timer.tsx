import { useEffect, useState } from "react";

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
    <div className="mb-auto text-right">
      <div className="mb-1 hidden text-sm xl:flex">Tempo restante</div>
      <div className="text-xs font-bold tabular-nums xl:text-lg">{time}</div>
    </div>
  );
};
