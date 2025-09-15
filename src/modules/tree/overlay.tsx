import { TREE_CONNECTOR_LINE_WIDTH_PX } from "@/common/constants/tree";
import type { Connector } from "./hooks/useVirtualTree";

interface OverlayProps {
  connectors: Connector[];
  totalHeight: number;
}

export const Overlay: React.FC<OverlayProps> = ({
  connectors,
  totalHeight,
}) => {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: totalHeight,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {connectors.map((c, i) => {
        if (c.type === "vertical") {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c.left,
                top: c.top,
                width: TREE_CONNECTOR_LINE_WIDTH_PX,
                height: c.height,
                backgroundColor: c.color,
                boxSizing: "border-box",
              }}
            />
          );
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              width: c.width,
              height: TREE_CONNECTOR_LINE_WIDTH_PX,
              backgroundColor: c.color,
              boxSizing: "border-box",
            }}
          />
        );
      })}
    </div>
  );
};
