import { useSyncExternalStore } from "react";
import { getTheme, subscribe, toggleTheme, setTheme } from "../lib/theme";

// Hook que expone el tema actual y se re-renderiza cuando cambia,
// aunque el cambio venga de otro componente (store compartido).
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme);
  return { theme, toggleTheme, setTheme };
}
