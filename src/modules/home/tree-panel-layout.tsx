import { createContext, useContext } from "react";

type TreePanelLayoutContextValue = {
  isCompactMenu: boolean;
  requestPanelExpand: (targetWidth?: number) => void;
};

const TreePanelLayoutContext = createContext<TreePanelLayoutContextValue>({
  isCompactMenu: false,
  requestPanelExpand: () => {},
});

export const TreePanelLayoutProvider = TreePanelLayoutContext.Provider;

export const useTreePanelLayout = () => useContext(TreePanelLayoutContext);
