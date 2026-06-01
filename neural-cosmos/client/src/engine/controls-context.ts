import { createContext, useContext } from "react";

/**
 * Lets a celestial body temporarily disable OrbitControls while it is being
 * dragged in "move" mode, so the orbit gesture doesn't fight the drag.
 */
export const ControlsContext = createContext<{
  setOrbitEnabled: (enabled: boolean) => void;
}>({ setOrbitEnabled: () => {} });

export const useControlsGate = () => useContext(ControlsContext);
