import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const FitBounds = ({ bounds }: { bounds: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 6);
    }
  }, [bounds, map]);

  return null;
};
